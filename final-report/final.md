---
title: Final Project Report CS-341 2024
---

# An Underwater Journey

![An image showing the final result](images/demo.jpg){width="300px"}


## Abstract

A procedurally generated underwater scene, with a focus on visual appeal and realism, featuring flocking fish and various types of algae.


## Overview

The scene features terrain generated from 3D perlin noise using the marching cubes algorithm.
Even though there is an exposed surface on top, most of the terrain is underwater, and that was the focus of this project.

There are two main effects that contribute to the underwater realism.
- A customisable fog (dark blue by default) that mimics the effect of objects being harder to see when separated from the camera by a layer of water. 
- An animated texture on the sea bed that mimics the effect of light refracting through surface waves.

As a minor feature, the user also has the option to enable posterization at various levels of discretization.

Furthermore, two kind of lifeforms give life to our scene.
- Several flocks of fish swimming around. These are implemented using boids.
- Various types of algae (or trees on the surface) which were procedurally generated using partially randomized L-systems.

Finally, even though the camera can be controlled manually by using the mouse and the keys `w`,`a`,`s`,`d`,`<space>`, there's also the option to press `b` to automatically move the camera along a preset bezier curve.

## Feature validation


### Terrain Generation

#### Implementation

We implemented it using a three dimensional Perlin noise. The noise is generated using gradients shuffled around based on a seed. We generate one such texture for each vertical "layer" of our terrain. Then we iterate through the width, height and depth to generate a mesh using the precomputed textures and the marching cubes algorithm.

The terrain color is computed in the shader based on these criteria:
- if we are at the top of the world, put grass
- if we are above water mix between stone at the bottom, sand in the middle and grass at the top
- if we are at the waterline put water color
- if we are underwater mix between grass, sand and stone
We then add the fog and procedurally generated texture

While building the mesh, we also randomly generate algae based on the flatness of the terrain.

#### Validation

![Multiple random seeds](./videos/terrain.mov)

Here we can see multiple terrains generated using a different random seed each time (we can regenerate a different terrain by pressing `r`)


### L-Systems

#### Implementation

We first implemented a simple function which takes a base, three axioms and a number of iterations and outputs the resulting string. For the three axioms, we randomize the output based on some probabilities to have a lot of diversity. We had to tweak it a lot in order to not have excessively unnatural algae but also making them look like both algae and bushes.

Once we have a string we interpret it as a mesh and return it. The mesh is built from cylinders with adjustable resolution and capped by cones. 

The mesh builder supports the following operations: Move forward, add a cap, decrease size, increase size, pitch up, pitch down, roll right, roll left, turn around, save state and load state. Most of these operations are somewhat randomized which further increases the diversity.

Algae color is determined by how deep it is. On the surface they are more brown to mimic trees or dead bushes whereas they are greener the deeper we go (to try and simulate glowing plants)

#### Validation

![](./images/algae%20(1).PNG){width="300px"}
![](./images/algae%20(2).PNG){width="300px"}
![](./images/algae%20(3).PNG){width="300px"}
![](./images/algae%20(4).PNG){width="300px"}
![](./images/algae%20(5).PNG){width="300px"}
![](./images/algae%20(6).PNG){width="300px"}
![](./images/algae%20(7).PNG){width="300px"}

We can see here that algae are quite various, while mostly being realistic (the result is better from slightly further away)

### Fog

#### Implementation

For the fog we had to make a concession. We decided not to make it a post-processing effect but rather implement it directly into each shaders. This unfortunately adds some complexity when adding new elements or changing code but it allows us to have a more realistic result around the waterline.

In particular, the fog has the four following behaviors depending on the position of the viewer and the drawn object:
- both are above the water level: This case is simple, there is no fog.
- the viewer is above water but not the object: The fog applies but have an increased minimum value to simulate real life.
- both are under water: The fog applies normally.
- the viewer is underwater but not he object: In this case the fog is always at its maximal value.

Even though some parameters are obviously better than others, we made the fog configurable by the user using sliders. We can adjust the color, minimum and maximum intensity and the distance at which each of these intensities are applied.

The fog intensity increases linearly between minimum and maximum since we found it was the most convincing effect for our use.

Fishes are intentionally less affected by the fog to give them a shinyer/glowy aspect and make them visible at a distance.


#### Validation

![close fog settings](./videos/fog-close.mov)

This video shows how the distance at which the fog is the densest gets closer as we increase the `fog close` parameter. We can also see the linear interpolation we make between the far and close fog.

![general fog settings](./videos/fog-settings.mov)

Here we can see how the different parameters affect the fog. We can also see the difference beween what is underwater and what is above the waterline.

![difference between above and under water](./videos/fog-in-out.mov)

Finally, this shows the change when we go from above water to under water (fog is slightly denser outside the water).


### Posterization

#### Implementation

Given that this is a post-processing effect, we had to modify our frame render to draw to a `framebuffer` instead of the screen.
Then we run our `posterization` shaders with the `framebuffer` as a texture and draw the buffer to the screen.

In terms of the shader itself, we followed [this posterization tutorial](#posterization-tutorial).
We first map the highest `rgb` component of the fragment color to a greyscale, and use the ratio between said greyscale
and a discretized version of it to scale the original color.

#### Validation

[Posterization video](./videos/posterization.mov)

The video shows two different levels of posterization. First with `levels=30`, approximately and then one with `levels=10`.

### Procedural Textures

#### Implementation

We implemented Worley noise following [this article on cellular noise](#cellular-tutorial).
We then played around with the code from [this worley noise demo](#worley-demo) in order to obtain a good color for our shader.
The most interesting parts of this exploration were a function that maps the linearly increasing distance to a non-linearly increasing light coefficient and the correction applied to prevent the center of the cells from looking too green.

This texture has to be dynamically updated each frame, so we use a buffer and a `regl.texture` object to handle that pipeline.

The texture is then blended into the underwater terrain to mimic the effect of light refracting through surface waves.

#### Validation

[This video](./videos/procedural-textures-flat.mov) shows the flat version of the texture, and [this other one](./videos/procedural-textures-scene.mov) shows how it blends into the scene.

You can run the file [`index_ptextures.html`](../code/index_ptextures.html) to look at the flat version.

### Bezier Curves

#### Implementation

We've implemented Bezier curves of degree 4, with the possibility of concatenating multiple ones to create arbitrarily long camera paths.

The relevant functions are all in [this file](../code/src/bezier.js).

#### Validation

[This video](./videos/bezier.mov) first shows the bezier curve being drawn in green, with the control points in red.

Then the camera follows the bezier curve.

On the first pass, the camera looks at the direction of the derivative.

On the second pass, it looks at a fixed target point.

### Boids

#### Implementation

Boids is a model to simulate flocking behaviour between objects. With just three rules, separation, alignment, and cohesion, very complex and emergent behavior can be observed in the resulting flock. Our implementation of these rules are explained below:

- `Separation:` A force is applied in the opposite direction of any other boids within a small radius.
- `Alignment:` A force is applied in the direction of the average velocity of all other boids within a larger radius.
- `Cohesion:` A force is applied in the direction of the average position of all other boids within a larger radius.

For our implementation, we create a list of `Boid objects`, and call an update function each frame for each object. The scaling factors affecting each boid are passed to this function, which allows the behaviour of the flock to be adjusted after initialization. The Boid object meanwhile holds properties such as position, velocity, acceleration, and the mesh that defines it. The object has a method for adding 'force' (acceleration) vectors to the boid which is added to its velocity the next time the boid is updated. For each boid, we add all the forces affecting it, then call the "update" method, which applies the forces to the boids velocity, and applies the resulting velocity on its position. The boid can then be drawn at its new position.

One drawback with the traditional boid implementation that we used is that it doesn't scale well. For every frame, each boid has to evaluate the distance to all other boids, giving us a complexity of O(n^2). There are implementations that scale better, however for our desired purposes our implementation is more than adequate, as we can render a few hundred fish without a noticeable drop in performance.

#### Validation

[This video,](./videos/procedural-textures-scene.mov) shown above, captures two schools of fish with around 60 fish each.


## Discussion

### Failed experiments

TODO

### Difficulties encountered and how we tackled them

We struggled most with integrating all the pieces together. We only allocated the last week for that but in hindsight we should have given more time for that. The boids also took longer than we expected, and taking them from 2D to 3D wasn't trivial.


## Contributions

<table>
	<caption>Worked hours</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Week 1</th>
			<th>Week 2</th>
			<th>Week 3</th>
			<th>Week 4</th>
			<th>Week 5</th>
			<th>Week 6</th>
			<th>Total</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Ugo Novello</td>
			<td>3</td>
			<td>4</td>
			<td>9</td>
			<td>9</td>
			<td>10</td>
			<td>30</td>
			<td>65</td>
		</tr>
		<tr>
			<td>Gabriel Jiménez</td>
			<td>3</td>
			<td>4</td>
			<td>9</td>
			<td>9</td>
			<td>2</td>
			<td>14</td>
			<td>41</td>
		</tr>
		<tr>
			<td>Michael Glanznig</td>
			<td>4</td>
			<td>4</td>
			<td>7</td>
			<td>1</td>
			<td>10</td>
			<td>14</td>
			<td>41</td>
		</tr>
	</tbody>
</table>

<table>
	<caption>Individual contributions</caption>
	<thead>
		<tr>
			<th>Name</th>
			<th>Contribution</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>Ugo Novello</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Gabriel Jiménez</td>
			<td>1/3</td>
		</tr>
		<tr>
			<td>Michael Glanznig</td>
			<td>1/3</td>
		</tr>
	</tbody>
</table>


#### Comments

Our initial estimates were not very accurate.
We spent a lot more time on this project than we imagined, mainly due to issues with javascript and the `regl` API.


## References




- <a name="posterization-tutorial"></a> [Posterization tutorial](https://lettier.github.io/3d-game-shaders-for-beginners/posterization.html) by David Lettier.
- <a name="cellular-tutorial"></a> [Cellular noise tutorial](https://thebookofshaders.com/12/) from The Book of Shaders.
- <a name="worley-demo"></a> [Worley noise demo](https://glslsandbox.com/e#23237.0) on GLSL Sandbox.
- <a name="boids-wikipedia"></a> [Boids](https://en.wikipedia.org/wiki/Boids) on Wikipedia.
- <a name="boids-paper"></a> [Boids](https://www.cs.toronto.edu/~dt/siggraph97-course/cwr87/) by Craig Reynolds.
- <a name="boids-rreuser"></a> [GPU Boids implementation](https://observablehq.com/@rreusser/gpgpu-boids) by Ricky Reusser.
- <a name="biods-lab"></a> [Lab2 - Boids](https://cs-214.epfl.ch/labs/boids/index.html) from CS-214 at EPFL.
- <a name="marching-cubes-algorithm"></a> [marching cubes algorithm](https://www.cs.montana.edu/courses/spring2005/525/students/Hunt1.pdf) by Robert Hunt
- <a name="marching-cubes-implementation"></a> [marching cubes implementation](https://paulbourke.net/geometry/polygonise/) by Paul Bourke
- <a name="bitwise-operators"></a> [bitwise operators in glsl 1.0](https://gist.github.com/mattatz/70b96f8c57d4ba1ad2cd) by mattatz on github
- <a name="perlin-noise"></a> [Perlin noise in 3D](https://github.com/josephg/noisejs/blob/master/perlin.js) by josephg on github
- <a name="hex-to-rgb"></a> [conversion from hex to rgb](https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb) on stackoverflow
- <a name="obj-file"></a> [.obj file](https://en.wikipedia.org/wiki/Wavefront_.obj_file) on Wikipedia
- <a name="biased-random"></a> [biased random number generator](https://stackoverflow.com/questions/29325069/how-to-generate-random-numbers-biased-towards-one-value-in-a-range) on stackoverflow

TODO
