#version 300 es
precision highp float;
precision highp sampler3D;

in vec2 vPosition2D;
out vec4 outColor;

uniform sampler2D uFrontFaceTexture;
uniform sampler2D uBackFaceTexture;
uniform sampler3D uVolumeTexture;

const float EPSILON = 0.001;
const int MAX_STEPS = 500;
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
        return vec4(1.0, 1.0, 1.0, 0.5); // red sphere
    else
        return vec4(0.0);
}

//=============================================================
// Shading Function 
 //=============================================================
vec4 shading(vec3 normal, vec3 view_dir, vec3 light_dir)
{
    float ambient = 0.25;
    float diffuse = max(dot(normal, light_dir), 0.0);

    vec3 half_dir = normalize(light_dir + view_dir);
    float spec = pow(max(dot(normal, half_dir), 0.0), 32.0);

    float lighting = ambient + 1.2 * diffuse + 0.6 * spec;
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

        float a = sample_color.a;
        accumulated_color += sample_color.rgb * a * (1.0 - accumulated_alpha);
        accumulated_alpha += a * (1.0 - accumulated_alpha);

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
    {
        // Background
         outColor = vec4(0.05f, 0.09f, 0.20f, 1.0f);
    }
    else
    {
        
        vec3 normal = normalize(vec3(
            vPosition2D.x - 0.5,
            vPosition2D.y - 0.5,
            0.8
        ));

        vec3 light_dir = normalize(vec3(0.0, 1.0, 0.0)); 
        vec3 view_dir  = normalize(vec3(0.0, 0.0, 1.0));

        vec4 shade = shading(normal, view_dir, light_dir);

        outColor = vec4(color.rgb * shade.rgb, 1.0);
    }
}
