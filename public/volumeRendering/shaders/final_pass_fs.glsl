#version 300 es
precision highp float;
precision highp sampler3D;

in vec2 vPosition2D;
out vec4 outColor;

uniform sampler2D uFrontFaceTexture;
uniform sampler2D uBackFaceTexture;
uniform sampler3D uVolumeTexture;


uniform vec3 uVolumeDimensions;

const float EPSILON = 0.001;
const int   MAX_STEPS = 500;
const float EARLY_TERMINATION = 0.95;
const float STEP_SIZE = 0.01;

//=============================================================
// Scalar Field
//=============================================================
float get_scalar_value(vec3 sample_pos)
{
    return texture(uVolumeTexture, sample_pos).r;
}

//=============================================================
// Transfer Function
//=============================================================
vec4 get_color_TF(float scalar)
{
    if (scalar >= 0.4)
        return vec4(1.0, 1.0, 1.0, 0.5);
    else
        return vec4(0.0);
}

//=============================================================
// Compute Normal 
//=============================================================
vec3 compute_normal(vec3 p)
{
    vec3 step = 1.0 / uVolumeDimensions;

    float dx = get_scalar_value(p + vec3(step.x, 0.0, 0.0)) -
               get_scalar_value(p - vec3(step.x, 0.0, 0.0));

    float dy = get_scalar_value(p + vec3(0.0, step.y, 0.0)) -
               get_scalar_value(p - vec3(0.0, step.y, 0.0));

    float dz = get_scalar_value(p + vec3(0.0, 0.0, step.z)) -
               get_scalar_value(p - vec3(0.0, 0.0, step.z));

    return normalize(vec3(dx, dy, dz));
}

//=============================================================
// Shading Function 
//=============================================================
vec4 shading(vec3 normal, vec3 view_dir, vec3 light_dir)
{
    float ambient = 0.3;
    float diffuse = max(dot(normal, light_dir), 0.0);

    vec3 half_dir = normalize(light_dir + view_dir);
    float spec = pow(max(dot(normal, half_dir), 0.0), 32.0);

    float lighting = ambient + 1.2 * diffuse + 0.5 * spec;
    lighting = clamp(lighting, 0.0, 1.0);

    return vec4(vec3(lighting), 1.0);
}

//=============================================================
// Raycasting
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

        float scalar = get_scalar_value(current_pos);
        vec4 sample_color = get_color_TF(scalar);

        if (sample_color.a > 0.0)
        {
            //  Normal لكل voxel
            vec3 normal = compute_normal(current_pos);

            vec3 light_dir = normalize(vec3(0.0, 1.0, 0.0));
            vec3 view_dir  = normalize(-ray_dir);

            vec4 shade = shading(normal, view_dir, light_dir);
            vec3 shaded_color = sample_color.rgb * shade.rgb;

            float a = sample_color.a;
            accumulated_color += shaded_color * a * (1.0 - accumulated_alpha);
            accumulated_alpha += a * (1.0 - accumulated_alpha);
        }

        current_pos += ray_dir * STEP_SIZE;
        traveled += STEP_SIZE;

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
