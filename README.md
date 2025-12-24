


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# cub3D Radians & Movement — Math Explained

## 📌 Purpose of This Repository

This repository exists to **visually and intuitively explain** the mathematics behind
movement and rotation in **cub3D**.

Many cub3D students can write code like:

```c
x += cos(angle) * speed;
y += sin(angle) * speed;
angle += rotation_speed;
but do not truly understand why it works.

This project explains:

What π really is

Why radians exist

Why cub3D uses radians (not degrees)

How sin and cos create movement

How rotation is actually motion along a circle

This is geometry, not magic.

1️⃣ What π Really Is
π is not “3.14”.

π is defined as a ratio:

𝜋
=
Circumference of a circle
Diameter
π= 
Diameter
Circumference of a circle
​
 
This ratio:

Is the same for all circles

Does not depend on size

Is a fundamental geometric constant

If this ratio were different for different circles, geometry would not work.

2️⃣ Why the Circumference Is 
2
𝜋
𝑟
2πr
From the definition:

𝜋
=
𝐶
𝐷
π= 
D
C
​
 
The diameter is:

𝐷
=
2
𝑟
D=2r
Substitute:

𝐶
=
𝜋
⋅
𝐷
=
𝜋
⋅
2
𝑟
=
2
𝜋
𝑟
C=π⋅D=π⋅2r=2πr
⚠️ Important:

This is not a physics law

This is pure definition + algebra

No calculus is involved

3️⃣ Why Degrees Are Artificial
Degrees were invented by humans (Babylonians).

Full circle = 360°

Chosen for convenience, not geometry

Degrees do not measure distance along a circle.

Example:

30° does not tell you how much arc you moved

You always need a conversion factor

This is why graphics engines and calculus avoid degrees.

4️⃣ What a Radian Really Is (KEY IDEA)
A radian measures arc length.

Definition:
An angle of 1 radian subtends an arc equal in length to the radius of the circle.

Mathematically:

𝜃
=
arc length
radius
θ= 
radius
arc length
​
 
Radians are:

Dimensionless

Geometrically natural

Directly related to movement

5️⃣ Why a Full Circle Is 
2
𝜋
2π Radians
For a circle of radius 
𝑟
r:

𝐶
=
2
𝜋
𝑟
C=2πr
Using the radian definition:

𝜃
full circle
=
𝐶
𝑟
=
2
𝜋
𝑟
𝑟
=
2
𝜋
θ 
full circle
​
 = 
r
C
​
 = 
r
2πr
​
 =2π
Full rotation
=
2
𝜋
 radians
Full rotation=2π radians
​
 
This is not a convention.
It is a geometric necessity.

6️⃣ Why Calculus Forces Radians
Consider:

𝑑
𝑑
𝑥
(
sin
⁡
𝑥
)
dx
d
​
 (sinx)
If 
𝑥
x is in radians:

𝑑
𝑑
𝑥
(
sin
⁡
𝑥
)
=
cos
⁡
𝑥
dx
d
​
 (sinx)=cosx
If 
𝑥
x is in degrees:

𝑑
𝑑
𝑥
(
sin
⁡
𝑥
)
=
𝜋
180
cos
⁡
𝑥
dx
d
​
 (sinx)= 
180
π
​
 cosx
That extra factor appears because degrees are scaled radians:

1
∘
=
𝜋
180
 radians
1 
∘
 = 
180
π
​
  radians
Radians avoid this problem because they measure true geometric distance.

7️⃣ The Unit Circle (Core Visualization)
In a unit circle:

Radius = 1

Angle in radians = arc length

𝑥
=
cos
⁡
(
𝜃
)
x=cos(θ)
𝑦
=
sin
⁡
(
𝜃
)
y=sin(θ)
As θ increases:

The point moves smoothly along the circle

cos(θ) gives horizontal direction

sin(θ) gives vertical direction

8️⃣ Direct Connection to cub3D
In cub3D:

c
Copy code
player.angle += rotation_speed;
player.x += cos(player.angle) * move_speed;
player.y += sin(player.angle) * move_speed;
What this means geometrically:

angle = arc length traveled on the unit circle

Rotation = sliding along the circle

cos(angle) = x-direction of facing

sin(angle) = y-direction of facing

Movement = projecting direction into the map

You are not using trigonometry.
You are moving along a circle.

9️⃣ Why π Is Unavoidable
π appears because:

Circles scale linearly

Arc length scales with radius

The ratio 
𝐶
/
𝑟
C/r is constant

That constant is 
2
𝜋
2π

π is:

Not arbitrary

Not chosen

Forced by geometry

🔁 Final Mental Model (IMPORTANT)
π → how much circle per diameter

radians → distance along a circle

sin / cos → direction vectors

rotation → motion along a circle

movement → projection into space

Radians are not angles — they are distances along a circle.
