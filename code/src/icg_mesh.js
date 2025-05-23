import {load_text} from "./icg_web.js"
import {Mesh} from "../lib/webgl-obj-loader_2.0.8/webgl-obj-loader.module.js"
import { vec3 } from "../lib/gl-matrix_3.3.0/esm/index.js";

/*
	Mesh construction and loading
*/

export function icg_mesh_make_uv_sphere(divisions) {
	const {sin, cos, PI} = Math;

	const v_resolution = divisions | 0; // tell optimizer this is an int
	const u_resolution = 2*divisions;
	const n_vertices = v_resolution * u_resolution;
	const n_triangles = 2 * (v_resolution-1) * (u_resolution - 1);

	const vertex_positions = [];
	const tex_coords = [];

	for(let iv = 0; iv < v_resolution; iv++) {
		const v = iv / (v_resolution-1);
		const phi = v * PI;
		const sin_phi = sin(phi);
		const cos_phi = cos(phi);

		for(let iu = 0; iu < u_resolution; iu++) {
			const u = iu / (u_resolution-1);

			const theta = 2*u*PI;


			vertex_positions.push([
				cos(theta) * sin_phi,
				sin(theta) * sin_phi,
				cos_phi, 
			]);

			tex_coords.push([
				u,
				v,
			])
		}
	}

	const faces = [];

	for(let iv = 0; iv < v_resolution-1; iv++) {
		for(let iu = 0; iu < u_resolution-1; iu++) {
			const i0 = iu + iv * u_resolution;
			const i1 = iu + 1 + iv * u_resolution;
			const i2 = iu + 1 + (iv+1) * u_resolution;
			const i3 = iu + (iv+1) * u_resolution;

			faces.push([i0, i1, i2]);
			faces.push([i0, i2, i3]);
		}
	}

	return {
		name: `UvSphere(${divisions})`,
		vertex_positions: vertex_positions,
		vertex_normals: vertex_positions, // on a unit sphere, position is equivalent to normal
		vertex_tex_coords: tex_coords,
		faces: faces,
	}
}

export function icg_mesh_make_cube() {
	return {
		name: 'Cube',
		vertex_positions: [
			// top
			[-1.0, -1.0,  1.0],
			[1.0, -1.0,  1.0],
			[1.0,  1.0,  1.0],
			[-1.0,  1.0,  1.0],
			// bottom
			[-1.0, -1.0, -1.0],
			[1.0, -1.0, -1.0],
			[1.0,  1.0, -1.0],
			[-1.0,  1.0, -1.0],
		],
		faces: [
			// front
			[0, 1, 2], [2, 3, 0],
			// right
			[1, 5, 6], [6, 2, 1],
			// back
			[7, 6, 5], [5, 4, 7],
			// left
			[4, 0, 3], [3, 7, 4],
			// bottom
			[4, 5, 1], [1, 0, 4],
			// top
			[3, 2, 6], [6, 7, 3],
		],
	}
}

export async function icg_mesh_load_obj(regl_instance, url, material_colors_by_name) {
	const obj_data = await load_text(url);
	const mesh_loaded_obj = new Mesh(obj_data);

	const faces_from_materials = [].concat(...mesh_loaded_obj.indicesPerMaterial);
	
	let vertex_colors = null;

	if(material_colors_by_name) {
		const material_colors_by_index = mesh_loaded_obj.materialNames.map((name) => {
			let color = material_colors_by_name[name];
			if (color === undefined) {
				console.warn(`Missing color for material ${name} in mesh ${url}`);
				color = [1., 0., 1.];
			}
			return color;
		});

		vertex_colors = [].concat(mesh_loaded_obj.vertexMaterialIndices.map((mat_idx) => material_colors_by_index[mat_idx]));
		vertex_colors = regl_instance.buffer(vertex_colors);
	}


	// Transfer the data into GPU buffers
	// It is not necessary to do so (regl can deal with normal arrays),
	// but this way we make sure its transferred only once and not on every draw.
	const mesh_with_our_names = {
		vertices: regl_instance.buffer(mesh_loaded_obj.vertices),
		vertex_tex_coords: regl_instance.buffer(mesh_loaded_obj.textures),
		normals: regl_instance.buffer(mesh_loaded_obj.vertexNormals),
		
		// https://github.com/regl-project/regl/blob/master/API.md#elements
		faces: regl_instance.elements({data: faces_from_materials, type: 'uint16'}),
		
		vertex_color: vertex_colors,

		lib_obj: mesh_loaded_obj,
	};

	return [mesh_with_our_names, mesh_loaded_obj];
}
export async function load_mesh(path, scale = [1, 1, 1]){
	let mesh = {
		vertices: [],
		normals: [],
		faces: [],
	}
	
	let response = await (await fetch(path)).text()

	const lines = response.split('\n')
	const vertices = []
	const tmp_normals = []
	const normals = []
	const faces = []
	for (const line of lines){
		const parts = line.split(' ')
		if (parts[0] === 'v'){
			let v = [parseFloat(parts[1]) * scale[0], parseFloat(parts[2]) * scale[1], parseFloat(parts[3]) * scale[2]]
			vertices.push(v)
			normals.push([])
		}
		else if (parts[0] === 'vn'){
			tmp_normals.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])])
		}
		else if (parts[0] === 'f'){
			const face = []
			for (let i = 1; i < parts.length; i++){
				const vertex = parts[i].split('/')
				let v_index = parseInt(vertex[0]) - 1
				face.push(v_index)

				// average normals of the vertices
				if (normals[v_index].length === 0){
					normals[v_index] = tmp_normals[parseInt(vertex[2]) - 1]
				} else {
					vec3.add(normals[v_index], normals[v_index], tmp_normals[parseInt(vertex[2]) - 1])
				}
			}
			faces.push(face)
		}
		for (let i = 0; i < normals.length; i++){
			vec3.normalize(normals[i], normals[i])
		}
	}

	mesh.vertices = vertices
	mesh.normals = normals
	mesh.faces = faces
	
	return mesh
}
