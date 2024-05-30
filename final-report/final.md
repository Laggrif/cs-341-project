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

TODO

#### Validation

TODO


### Fog

#### Implementation

TODO

#### Validation

TODO


### Posterization

#### Implementation

Given that this is a post-processing effect, we had to modify our frame render to draw to a `framebuffer` instead of the screen.
Then we run our `posterization` shaders with the `framebuffer` as a texture and draw the buffer to the screen.

In terms of the shader itself, we followed [this tutorial](#posterization-tutorial).
We first map the highest `rgb` component of the fragment color to a greyscale, and use the ratio between said greyscale
and a discretized version of it to scale the original color.

#### Validation

[Posterization video](./images/posterization.mov)

The video shows two different levels of posterization. First with `levels=30`, approximately and then one with `levels=10`.

### Procedural Textures

#### Implementation

TODO

#### Validation

TODO

### Bezier Curves

#### Implementation

TODO

#### Validation

TODO

### Boids

#### Implementation

Boids is a model to simulate flocking behaviour between objects. With just three rules, separation, alignment, and cohesion, very complex and emergent behavior can be observed in the resulting flock. Our implementation of these rules are explained below:

- `Separation:` A force is applied in the opposite direction of any other boids within a small radius.
- `Alignment:` A force is applied in the direction of the average velocity of all other boids within a larger radius.
- `Cohesion:` A force is applied in the direction of the average position of all other boids within a larger radius.

For our implementation, we create a list of `Boid objects`, and call an update function each frame for each object. The scaling factors affecting each boid are passed to this function, which allows the behaviour of the flock to be adjusted after initialization. The Boid object meanwhile holds properties such as position, velocity, acceleration, and the mesh that defines it. The object has a method for adding 'force' (acceleration) vectors to the boid which is added to its velocity the next time the boid is updated. For each boid, we add all the forces affecting it, then call the "update" method, which applies the forces to the boids velocity, and applies the resulting velocity on its position. The boid can then be drawn at its new position.

One drawback with the traditional boid implementation that we used is that it doesn't scale well. For every frame, each boid has to evaluate the distance to all other boids, giving us a complexity of O(n^2). There are implementations that scale better, however for our desired purposes our implementation is more than adequate, as we can render a few hundred fish without a noticeable drop in performance.

#### Validation

TODO


## Discussion

### Failed experiments

TODO

### Difficulties encountered and how we tackled them

TODO


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
			<td>TODO</td>
			<td>TODO</td>
			<td>TODO</td>
			<td>TODO</td>
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
- <a name="boids-wikipedia"></a> [Boids](https://en.wikipedia.org/wiki/Boids) on Wikipedia.
- <a name="boids-paper"></a> [Boids](https://www.cs.toronto.edu/~dt/siggraph97-course/cwr87/) by Craig Reynolds.
- <a name="boids-rreuser"></a> [GPU Boids implementation](https://observablehq.com/@rreusser/gpgpu-boids) by Ricky Reusser.
- <a name="biods-lab"></a> [Lab2 - Boids](https://cs-214.epfl.ch/labs/boids/index.html) from CS-214 at EPFL.



TODO
