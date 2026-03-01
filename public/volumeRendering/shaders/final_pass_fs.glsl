#version 300 es
precision highp float;
precision highp sampler3D;
precision highp sampler2D;

in vec2 vPosition2D;
out vec4 outColor;

uniform sampler2D uFrontFaceTexture;
uniform sampler2D uBackFaceTexture;
uniform sampler3D uVolumeTexture;
uniform sampler3D uMinMaxOctree;
uniform sampler3D uNormalTexture;  // ← Normal Texture الجديد

uniform float uBlockSize;
uniform int uEnableEmptySpaceSkipping;

uniform vec3 uVolumeDimensions;

uniform int uNumSteps;
uniform float uTFRangeStarts[10];
uniform float uTFRangeEnds[10];
uniform vec3 uTFColors[10];
uniform float uTFOpacities[10];

//=============================================================
// Constants
//=============================================================
const float EPSILON = 0.001;
const int   MAX_STEPS = 5000;
const float EARLY_TERMINATION = 0.95;

const float STEP_SIZE = 0.0005;
const float LARGE_STEP_SIZE = 0.004;

const float TF_THRESHOLD_MIN = 0.4;

//=============================================================
// Scalar Field
//=============================================================
float get_scalar_value(vec3 sample_pos)
{
    return texture(uVolumeTexture, sample_pos).r;
}

//=============================================================
// Empty Space Detection
//=============================================================
bool is_empty_space(vec3 sample_pos)
{
    if (uEnableEmptySpaceSkipping == 0)
        return false;

    vec2 minmax = texture(uMinMaxOctree, sample_pos).rg;
    float maxVal = minmax.g;

    return maxVal < 0.005;
}

//=============================================================
// Transfer Function 
//=============================================================
vec4 get_color_TF(float scalar)
{
    float hounsfield = scalar * 2000.0 - 1000.0;

    if (uNumSteps == 0) {
        vec3 color = vec3(0.0);
        float alpha = 0.0;

        // هواء - أسود شفاف
        if (hounsfield <= -800.0) {
            color = vec3(0.0, 0.0, 0.0);
            alpha = 0.0;

        // دهون - أصفر فاتح
        } else if (hounsfield > -150.0 && hounsfield <= -80.0) {
            color = vec3(1.0, 0.87, 0.6);
            alpha = 0.15;

        // سائل نخاعي CSF - أزرق فاتح
        } else if (hounsfield > 0.0 && hounsfield <= 20.0) {
            color = vec3(0.68, 0.85, 0.90);
            alpha = 0.20;

        // المادة البيضاء White Matter - بيج فاتح
        } else if (hounsfield > 20.0 && hounsfield <= 35.0) {
            color = vec3(0.91, 0.84, 0.69);
            alpha = 0.50;

        // المادة الرمادية Gray Matter - بيج داكن
        } else if (hounsfield > 35.0 && hounsfield <= 50.0) {
            color = vec3(0.78, 0.66, 0.53);
            alpha = 0.55;

        // نزيف / دم طازج - أحمر
        } else if (hounsfield > 50.0 && hounsfield <= 80.0) {
            color = vec3(0.80, 0.13, 0.0);
            alpha = 0.60;

        // عظام الجمجمة - أبيض
        } else if (hounsfield > 300.0 && hounsfield <= 1000.0) {
            color = vec3(0.96, 0.96, 0.94);
            alpha = 1.0;

        } else {
            alpha = 0.0;
        }

        return vec4(color, alpha);
    }

    // Manual Mode
    for (int i = 0; i < 10; i++) {
        if (i >= uNumSteps) break;

        if (hounsfield >= uTFRangeStarts[i] && hounsfield <= uTFRangeEnds[i]) {
            return vec4(uTFColors[i], uTFOpacities[i]);
        }
    }

    return vec4(0.0, 0.0, 0.0, 0.0);
}

//=============================================================
// Compute Normal from View Direction (faster method)
//=============================================================
vec3 compute_normal_from_view(vec3 ray_dir)
{
    return normalize(-ray_dir);
}

//=============================================================
// Get Normal from Texture (fastest method - pre-computed)
//=============================================================
vec3 get_normal_from_texture(vec3 sample_pos)
{
    // قراءة النورمال من الـ texture
    vec3 normal = texture(uNormalTexture, sample_pos).rgb;
    
    // تحويل من [0, 1] إلى [-1, 1]
    normal = normal * 2.0 - 1.0;
    
    return normalize(normal);
}

//=============================================================
// Compute Normal (OLD - slow method, keep for reference)
//=============================================================
vec3 compute_normal(vec3 p)
{
    float step = 0.001;

    float dx = get_scalar_value(p + vec3(step, 0.0, 0.0)) -
               get_scalar_value(p - vec3(step, 0.0, 0.0));

    float dy = get_scalar_value(p + vec3(0.0, step, 0.0)) -
               get_scalar_value(p - vec3(0.0, step, 0.0));

    float dz = get_scalar_value(p + vec3(0.0, 0.0, step)) -
               get_scalar_value(p - vec3(0.0, 0.0, step));

    return normalize(vec3(dx, dy, dz));
}

//=============================================================
// Shading Function
//=============================================================
vec3 shading(vec3 normal, vec3 view_dir, vec3 light_dir)
{
    float k_d = 0.6;
    float k_s = 0.1;
    float n = 32.0;

    float ambient = 0.3;
    float diffuse = max(dot(normal, light_dir), 0.0);

    vec3 half_dir = normalize(light_dir + view_dir);
    float spec = pow(max(dot(normal, half_dir), 0.0), n);

    float lighting = ambient + k_d * diffuse + k_s * spec;
    lighting = clamp(lighting, 0.0, 1.0);

    return vec3(lighting);
}

//=============================================================
// Raycasting with Empty Space Skipping
//=============================================================
vec4 raycasting()
{
    vec3 entry_pos = texture(uFrontFaceTexture, vPosition2D).rgb;
    vec3 exit_pos  = texture(uBackFaceTexture,  vPosition2D).rgb;

    vec3 ray_dir = exit_pos - entry_pos;
    float ray_length = length(ray_dir);

    if (ray_length < EPSILON)
        return vec4(-1.0);

    ray_dir = normalize(ray_dir);

    vec3 current_pos = entry_pos;
    vec3 accumulated_color = vec3(0.0);
    float accumulated_alpha = 0.0;

    float traveled = 0.0;
    int steps = 0;

    while (traveled < ray_length && steps < MAX_STEPS)
    {
        steps++;

        // Empty Space Skipping
        if (uEnableEmptySpaceSkipping==1 && is_empty_space(current_pos))
        {
           current_pos += ray_dir * LARGE_STEP_SIZE;
           traveled += LARGE_STEP_SIZE;
           continue;
        }

        // Normal Sampling
        float scalar = get_scalar_value(current_pos);
        vec4 sample_color = get_color_TF(scalar);

        if (sample_color.a > 0.0)
        {
            // استخدام النورمال من الـ Texture (الأسرع!) ✅
            vec3 normal = get_normal_from_texture(current_pos);
            
            // البدائل الأخرى (اختاري وحدة):
            // vec3 normal = compute_normal_from_view(ray_dir);  // سريعة
            // vec3 normal = compute_normal(current_pos);        // بطيئة جداً

            vec3 light_dir = normalize(vec3(1.0, 1.0, 1.0) - current_pos);
            vec3 view_dir  = normalize(-ray_dir);

            vec3 shade = shading(normal, view_dir, light_dir);
            vec3 shaded_color = sample_color.rgb * shade;

            float a = sample_color.a;
            accumulated_color += shaded_color * a * (1.0 - accumulated_alpha);
            accumulated_alpha += a * (1.0 - accumulated_alpha);
        }

        current_pos += ray_dir * STEP_SIZE;
        traveled += STEP_SIZE;
        
        // Early Ray Termination
        if (accumulated_alpha > EARLY_TERMINATION)
            break;
    }

    return vec4(accumulated_color, accumulated_alpha);
}

//=============================================================
// Main
//=============================================================
void main()
{
    vec4 color = raycasting();

    if (color.a < 0.0)
        outColor = vec4(0.05, 0.05, 0.05, 1.0);
    else
        outColor = vec4(color.rgb, 1.0);
}
