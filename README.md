


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# cub3D Radians & Movement — Math Explained
# cub3D Radians & Movement — Math Explained

## Purpose of This Repository

This repository exists to explain the mathematics behind movement and rotation in **cub3D**.

Many cub3D students can write code like:

```c
player.x += cos(player.angle) * speed;
player.y += sin(player.angle) * speed;
player.angle += rotation_speed;
```

But don’t truly understand why it works.

This README explains:
- What $\pi$ really is
- Why radians exist
- Why cub3D uses radians (not degrees)
- How $\sin$ and $\cos$ create movement
- How rotation is motion along a circle

This is geometry, not magic.

---

## 1) What $\pi$ Really Is

$\pi$ is not “3.14”.

$\pi$ is defined as a ratio:

$$
\pi = \frac{\text{circumference of a circle}}{\text{diameter}}
$$

This ratio:
- Is the same for all circles
- Does not depend on size
- Is a fundamental geometric constant

If this ratio were different for different circles, geometry would not work.

---

## 2) Why the Circumference Is $2\pi r$

From the definition:

$$
\pi = \frac{C}{D}
$$

The diameter is:

$$
D = 2r
$$

Substitute:

$$
C = \pi\cdot D = \pi\cdot 2r = 2\pi r
$$

Important:
- This is definition + algebra
- No calculus is involved

---

## 3) Why Degrees Are Artificial

Degrees were invented by humans.

- Full circle = $360^\circ$ (chosen for convenience)
- Degrees do not directly measure distance along a circle
- You always need a conversion factor to connect degrees to arc length

This is why graphics engines and math libraries avoid degrees internally.

---

## 4) What a Radian Really Is (Key Idea)

A radian measures **arc length**.

Definition:
An angle of $1$ radian subtends an arc equal in length to the radius of the circle.

Mathematically:

$$
\theta = \frac{\text{arc length}}{r}
$$

Radians are:
- Dimensionless
- Geometrically natural
- Directly related to movement

---

## 5) Why a Full Circle Is $2\pi$ Radians

For a circle of radius $r$:

$$
C = 2\pi r
$$

Using the radian definition for a full revolution:

$$
\theta_{full} = \frac{C}{r} = \frac{2\pi r}{r} = 2\pi
$$

Full rotation = $2\pi$ radians.

This is not a convention — it is forced by geometry.

---

## 6) Why Calculus Forces Radians

If $x$ is in radians:

$$
\frac{d}{dx}(\sin x) = \cos x
$$

If $x$ is in degrees:

$$
\frac{d}{dx}(\sin x) = \frac{\pi}{180}\cos x
$$

That extra factor appears because degrees are scaled radians:

$$
1^\circ = \frac{\pi}{180}\ \text{radians}
$$

Radians avoid this problem because they measure true geometric distance.

---

## 7) The Unit Circle (Core Visualization)

In a unit circle:
- radius $r = 1$
- angle in radians = arc length

The point on the circle at angle $\theta$ is:

$$
x = \cos(\theta)\quad\quad y = \sin(\theta)
$$

As $\theta$ increases:
- the point moves smoothly along the circle
- $\cos(\theta)$ gives the horizontal component
- $\sin(\theta)$ gives the vertical component

---

## 8) Direct Connection to cub3D

In cub3D:

```c
player.angle += rotation_speed;
player.x += cos(player.angle) * move_speed;
player.y += sin(player.angle) * move_speed;
```

Geometric meaning:
- `angle` is your position on the unit circle
- rotation is sliding along that circle
- `cos(angle)` is the x-component of the facing direction
- `sin(angle)` is the y-component of the facing direction
- movement is projecting that direction into the 2D world

You are not doing “random trigonometry”.
You are using the unit circle to get a direction vector.

---

## 9) Why $\pi$ Is Unavoidable

$\pi$ appears because:
- circles scale linearly
- arc length scales with radius
- the ratio $C/r$ is constant
- that constant is $2\pi$

$\pi$ is not arbitrary — it is forced by geometry.

---

## Final Mental Model

- $\pi$ → how much circle per diameter
- radians → distance along a circle
- $\sin$ / $\cos$ → direction vector components
- rotation → motion along the unit circle
- movement → projection into world space

Radians are not just “angles” — they are distances along a circle.


