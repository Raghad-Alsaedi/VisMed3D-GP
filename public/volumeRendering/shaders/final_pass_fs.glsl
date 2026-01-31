#version 300 es
precision highp float;

in vec2 vPosition2D;
in vec3 vPosition3D;

out vec4 outColor;

uniform sampler2D uFrontFaceTexture;
uniform sampler2D uBackFaceTexture;


const float EPSILON = 0.001;
const int  MAX_STEPS = 500;
const float EARLY_TERMINATION = 0.95;
const float STEP_SIZE =0.01;
//=============================================================
//********* shading function *********************************
//=============================================================
vec4 shading(vec3 normal,vec3 view_dir, vec3 light_dir)
{
   return vec4(1);
}
//=============================================================
//********* transfer function *********************************
//=============================================================
vec4 get_color_TF(float scalar_value)
{
    if(scalar_value >=1.0)
    {
        vec3 color=vec3(1,0,0);
        float opacity=0.5;
        return vec4(color,opacity);
    }
    else{

        vec3 color=vec3(0,0,0);
        float opacity=0.0;
        return vec4(color,opacity);
    }
}
//=============================================================
//=============================================================
float get_scalar_value(vec3 sample_pos)
{
    vec3 c = vec3(0.5);
    float r = 0.25;

    if (distance(sample_pos, c) <= r)
        return 1.0;
    else
        return 0.0;
}
//=============================================================
//********* raycasting function *********************************
//=============================================================
vec4 raycasting()
{
    vec4 front = texture(uFrontFaceTexture, vPosition2D);
    vec4 back  = texture(uBackFaceTexture, vPosition2D);


    vec3 entry_pos = front.rgb;
    vec3 exit_pos = back.rgb;

 
    vec3 ray_dir = exit_pos - entry_pos;
    float ray_length = length(ray_dir);

    if (ray_length < EPSILON) {

        return vec4(-1.0);
    }

    ray_dir = normalize(ray_dir);

    vec3 current_pos = entry_pos;

    vec3 accumulated_color = vec3(0.0);
    float accumulated_alpha = 0.0;

    float traveled_distance = 0.0;
    int steps = 0;

    while (traveled_distance < ray_length && steps < MAX_STEPS) {
        steps++;


        float scalar = get_scalar_value(current_pos);


        vec4 sample_color = get_color_TF(scalar);

        float src_alpha = sample_color.a;
        accumulated_color += sample_color.rgb * src_alpha * (1.0 - accumulated_alpha);
        accumulated_alpha += src_alpha * (1.0 - accumulated_alpha);


        current_pos += ray_dir * STEP_SIZE;
        traveled_distance += STEP_SIZE;


        if (accumulated_alpha > EARLY_TERMINATION) {
            break;
        }
    }

    return vec4(accumulated_color,accumulated_alpha);

}
//=============================================================
//********* main function *********************************
//=============================================================

void main() {

    vec4 color = raycasting();
    if(color.a<0.0) //background
    {
        outColor = vec4(0.05, 0.05, 0.15, 1.0);
        //outColor = vec4(0.0, 0.0, 0.0, 1.0); 
    }
    else{
        //color.rgb *= shading(.....)
        
         outColor = vec4(color.rgb, 1.0);
    }
}