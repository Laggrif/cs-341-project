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

TODO

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

TODO

#### Validation

TODO


## Discussion

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
			<td>TODO</td>
			<td>TODO</td>
			<td>TODO</td>
			<td>TODO</td>
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

TODO
