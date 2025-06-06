precision highp float;

uniform sampler2D u_water_texture;

varying float v2f_height;
varying vec2 uv;

/* #TODO PG1.6.1: Copy Blinn-Phong shader setup from previous exercises */
varying vec3 v2f_normal;
varying vec3 v2f_dir_from_view;
varying vec3 v2f_dir_to_light;

varying float dist_to_view;

uniform float zoom;

uniform vec3 fog_color;
uniform vec2 closeFarThreshold;
uniform vec2 minMaxIntensity;
uniform bool useFog;
uniform vec3 cam_pos;

const vec3  light_color = vec3(1.0, 0.941, 0.898);
// Small perturbation to prevent "z-fighting" on the water on some machines...
const float terrain_water_level    = 90.5;
const vec3  terrain_color_water    = vec3(0.35, 0.63, 0.84);
const vec3  terrain_color_stone    = vec3(0.43, 0.44, 0.45);
const vec3  terrain_color_grass    = vec3(0.29, 0.83, 0.35);
const vec3  terrain_color_sand     = vec3(0.70, 0.62, 0.45);

void main()
{
	float material_ambient = 0.1; // Ambient light coefficient
	float height = v2f_height;

	/* #TODO PG1.6.1
	Compute the terrain color ("material") and shininess based on the height as
	described in the handout. `v2f_height` may be useful.
	
	Water:
			color = terrain_color_water
			shininess = 30.
	Ground:
			color = interpolate between terrain_color_grass and terrain_color_mountain, weight is (height - terrain_water_level)*2
	 		shininess = 2.
	*/
	vec3 material_color = vec3(0.0);
	float shininess = 0.;

	if (abs(height - terrain_water_level) < 0.1) {
		material_color = terrain_color_water;
		shininess = 3.;
	} else if (height > terrain_water_level) {
		float weight = (height - terrain_water_level) / 6.;
		material_color = mix(terrain_color_sand, terrain_color_stone, weight);
		if (height > terrain_water_level + 1.) {
			material_color = mix(material_color, terrain_color_grass, weight);
		}
		shininess = 40.;
	} else {
		float weight = (height / terrain_water_level);
		material_color = mix(terrain_color_sand, terrain_color_grass, weight);
		material_color = mix(material_color, terrain_color_stone, 1. - weight);
		material_color = mix(material_color, terrain_color_sand, weight);
		material_color = mix(material_color, texture2D(u_water_texture, uv).xyz, 0.5);
		shininess = 30.;
	}


	/* #TODO PG1.6.1: apply the Blinn-Phong lighting model
    	Add the Blinn-Phong implementation from GL2 here.
	*/
	vec3 l = normalize(v2f_dir_to_light);
	vec3 v = normalize(v2f_dir_from_view);
	vec3 h = normalize(l + v);
	vec3 vertex_normal_view = normalize(v2f_normal);

	vec3 ambient = material_ambient * material_color * light_color;
	vec3 diffuse = max(dot(vertex_normal_view, l), 0.0) * light_color * material_color;
	vec3 specular = pow(max(dot(vertex_normal_view, h), 0.0), shininess) * light_color * material_color;

	vec3 color = clamp(ambient + diffuse + specular, 0.0, 1.0);

	if (useFog && (height < terrain_water_level - 0.01 || cam_pos.z < terrain_water_level)){
		float dtv = dist_to_view;
		float fogFactor;
		if (cam_pos.z < terrain_water_level && height > terrain_water_level - 0.01) {
			fogFactor = clamp(pow(dtv - closeFarThreshold.x, 0.5) / (closeFarThreshold.y - closeFarThreshold.x), min(minMaxIntensity.y, 1.), minMaxIntensity.y);
		}
		else if (cam_pos.z > terrain_water_level && height < terrain_water_level - 0.01) {
			fogFactor = clamp(pow(dtv - closeFarThreshold.x, 0.5) / (closeFarThreshold.y - closeFarThreshold.x), min(minMaxIntensity.y, 0.6), minMaxIntensity.y);
		}
		else {
			fogFactor = clamp(pow(dtv - closeFarThreshold.x, 0.5) / (closeFarThreshold.y - closeFarThreshold.x), minMaxIntensity.x, minMaxIntensity.y);
		}
		color = mix(color, fog_color, fogFactor);
	}

	vec4 color4 = vec4(color, 1.);

	gl_FragColor = color4; // output: RGBA in 0..1 range
}
