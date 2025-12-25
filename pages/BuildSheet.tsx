import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Tex from '../components/Math';

export default function BuildSheet() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">cub3D Build Sheet (step-by-step)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          A practical checklist you can follow to implement cub3D cleanly. Each step matches the concepts from your guide:
          parsing/validation → vectors & plane → DDA → fish-eye fix → projection → textures → MLX pixels → movement.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">0) Minimum data model (your structs)</h2>
        <p className="text-slate-400 leading-relaxed">
          Before coding algorithms, lock the structs. This prevents 90% of refactors during defense.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`// map is always accessed as map[y][x]
// keep both: raw lines for parsing + padded grid for checks

typedef struct s_vec2 { double x; double y; } t_vec2;

typedef struct s_img {
  void *ptr;
  char *addr;
  int bpp;
  int line_len;
  int endian;
  int w;
  int h;
} t_img;

typedef struct s_player {
  t_vec2 pos;      // double grid coords (center inside tile)
  t_vec2 dir;      // look direction
  t_vec2 plane;    // camera plane (perpendicular to dir)
  double move_spd;
  double rot_spd;
} t_player;

typedef struct s_ray {
  int x;           // current screen column
  double camera_x; // [-1..1]
  t_vec2 dir;      // ray direction

  int map_x; int map_y;
  t_vec2 delta;    // deltaDistX/Y
  t_vec2 side;     // sideDistX/Y
  int step_x; int step_y;
  int hit; int side_hit; // 0 = x-side, 1 = y-side

  double perp_dist;
  int line_h;
  int draw_start;
  int draw_end;

  double wall_x;   // texture coordinate [0..1)
  int tex_x;
} t_ray;

typedef struct s_game {
  char **map;      // ragged lines OR padded grid
  int map_w;
  int map_h;
  t_player p;
  t_img frame;
  t_img tex[4];    // NO, SO, WE, EA
  int ceil_rgb;
  int floor_rgb;
} t_game;`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">1) Parse .cub file (order-independent, map last)</h2>
        <p className="text-slate-400 leading-relaxed">
          Split into two phases: (A) read tokens/textures/colors, (B) read the map block as raw lines.
          The map must keep spaces — they are void.
        </p>

        <ASCIIDiagram
          caption="Parsing strategy: detect map start, then keep raw lines." 
          content={`
[FILE]
NO ./path.xpm
SO ./path.xpm
F  220,100,0

111111
1N0  1   <- spaces are part of map
111111

[PHASE A] parse identifiers until first line that "looks like map"
[PHASE B] from there -> store all remaining lines (including spaces)
`}
        />

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Map rules (defense level)</div>
          <ul className="list-disc pl-5 text-slate-300 space-y-2">
            <li>Allowed chars only: <code className="text-slate-200">0 1 N S E W</code> and space.</li>
            <li>Exactly one player spawn.</li>
            <li>No empty line inside map block.</li>
            <li>Closed map: any walkable tile (<code className="text-slate-200">0</code> or player) cannot touch void(space) or out-of-bounds.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">2) Initialize direction + camera plane</h2>
        <p className="text-slate-400 leading-relaxed">
          Player orientation sets <code className="text-slate-200">dir</code>. The camera plane is perpendicular to dir.
          Plane length controls FOV (0.66 is the classic ~66° for Wolf3D-style).
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Perpendicular plane</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`plane = \begin{bmatrix}-dir_y\\dir_x\end{bmatrix}\cdot planeLen`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            If <code className="text-slate-200">dir=(1,0)</code>, then <code className="text-slate-200">plane=(0, planeLen)</code>.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Spawn → dir</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`N:(0,-1)\quad S:(0,1)\quad E:(1,0)\quad W:(-1,0)`}
            </Tex>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">3) Main render loop (one ray per column)</h2>
        <p className="text-slate-400 leading-relaxed">
          For each screen x, compute <code className="text-slate-200">cameraX</code> in [-1..1], then build the ray direction.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`cameraX = 2\cdot\frac{x}{w}-1\qquad rayDir = dir + plane\cdot cameraX`}</Tex>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`for (x = 0; x < w; x++) {
  ray.camera_x = 2.0 * x / (double)w - 1.0;
  ray.dir.x = p.dir.x + p.plane.x * ray.camera_x;
  ray.dir.y = p.dir.y + p.plane.y * ray.camera_x;

  // DDA setup -> DDA loop -> perpWallDist
  // projection -> texture coords -> draw column
}`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">4) DDA setup (deltaDist + sideDist)</h2>
        <p className="text-slate-400 leading-relaxed">
          Convert player float position to current map cell. Then compute how far you must travel to cross each grid boundary.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Deltas</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`\Delta_x = \left|\frac{1}{rayDir_x}\right|\qquad\Delta_y = \left|\frac{1}{rayDir_y}\right|`}</Tex>
          </div>
          <p className="text-slate-500 text-sm">
            If a component is 0, set that delta to a huge number (never crosses those gridlines).
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`ray.map_x = (int)p.pos.x;
ray.map_y = (int)p.pos.y;

ray.delta.x = (ray.dir.x == 0) ? 1e30 : fabs(1.0 / ray.dir.x);
ray.delta.y = (ray.dir.y == 0) ? 1e30 : fabs(1.0 / ray.dir.y);

ray.step_x = (ray.dir.x < 0) ? -1 : 1;
ray.step_y = (ray.dir.y < 0) ? -1 : 1;

if (ray.dir.x < 0) ray.side.x = (p.pos.x - ray.map_x) * ray.delta.x;
else              ray.side.x = (ray.map_x + 1.0 - p.pos.x) * ray.delta.x;

if (ray.dir.y < 0) ray.side.y = (p.pos.y - ray.map_y) * ray.delta.y;
else              ray.side.y = (ray.map_y + 1.0 - p.pos.y) * ray.delta.y;`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">5) DDA loop (step until wall)</h2>
        <p className="text-slate-400 leading-relaxed">
          Each iteration picks the closer next intersection: if sideDistX is smaller, you cross a vertical gridline (x-side), else a horizontal gridline (y-side).
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`ray.hit = 0;
while (ray.hit == 0) {
  if (ray.side.x < ray.side.y) {
    ray.side.x += ray.delta.x;
    ray.map_x += ray.step_x;
    ray.side_hit = 0;
  } else {
    ray.side.y += ray.delta.y;
    ray.map_y += ray.step_y;
    ray.side_hit = 1;
  }
  if (map[ray.map_y][ray.map_x] == '1') ray.hit = 1;
}`}</pre>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">perpWallDist (fish-eye fix)</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>
              {String.raw`perpWallDist = \begin{cases} sideDistX - \Delta_x & \text{if x-side}\\ sideDistY - \Delta_y & \text{if y-side}\end{cases}`}
            </Tex>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">6) Projection: lineHeight + drawStart/drawEnd</h2>
        <p className="text-slate-400 leading-relaxed">
          Now you turn distance into a vertical slice. Clamp the drawing range to the screen.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`lineHeight = \left\lfloor\frac{screenH}{perpWallDist}\right\rfloor`}</Tex>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`ray.line_h = (int)(h / ray.perp_dist);
ray.draw_start = -ray.line_h / 2 + h / 2;
ray.draw_end   =  ray.line_h / 2 + h / 2;

if (ray.draw_start < 0) ray.draw_start = 0;
if (ray.draw_end >= h) ray.draw_end = h - 1;`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">7) Texture mapping (wallX → texX → texY)</h2>
        <p className="text-slate-400 leading-relaxed">
          You need the fractional hit coordinate along the wall (0..1). That becomes <code className="text-slate-200">texX</code>.
          Then for each y in the slice, compute <code className="text-slate-200">texY</code> by scaling.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`if (ray.side_hit == 0) ray.wall_x = p.pos.y + ray.perp_dist * ray.dir.y;
else                  ray.wall_x = p.pos.x + ray.perp_dist * ray.dir.x;
ray.wall_x -= floor(ray.wall_x);

ray.tex_x = (int)(ray.wall_x * (double)tex.w);

// flip depending on side + ray direction
if (ray.side_hit == 0 && ray.dir.x > 0) ray.tex_x = tex.w - ray.tex_x - 1;
if (ray.side_hit == 1 && ray.dir.y < 0) ray.tex_x = tex.w - ray.tex_x - 1;`}</pre>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`// for each y in [draw_start..draw_end]
// use an integer "d" trick to avoid floats, or do double scale
int d = y * 256 - h * 128 + ray.line_h * 128;
ray.tex_y = ((d * tex.h) / ray.line_h) / 256;`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">8) MLX pixel write (framebuffer)</h2>
        <p className="text-slate-400 leading-relaxed">
          You draw columns into an off-screen image, then put it to the window.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`static void put_px(t_img *img, int x, int y, int color)
{
  char *dst;

  if (x < 0 || y < 0 || x >= img->w || y >= img->h) return;
  dst = img->addr + (y * img->line_len + x * (img->bpp / 8));
  *(unsigned int*)dst = (unsigned int)color;
}`}</pre>
        </div>

        <ASCIIDiagram
          caption="Three passes per column: ceiling, wall (texture), floor." 
          content={`
for x in [0..w):
  draw y: [0 .. drawStart)       -> ceiling color
  draw y: [drawStart..drawEnd]   -> wall texture
  draw y: (drawEnd .. h)         -> floor color
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">9) Movement + rotation + collision</h2>
        <p className="text-slate-400 leading-relaxed">
          Move along the direction vector. For collision, check the next cell before committing.
          Rotation applies a matrix to both dir and plane.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Rotation matrix</div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`\begin{aligned}
 x' &= x\cos a - y\sin a\\
 y' &= x\sin a + y\cos a
\end{aligned}`}</Tex>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm text-slate-200 overflow-auto">
          <pre>{`// forward/back
next_x = p.pos.x + p.dir.x * p.move_spd;
next_y = p.pos.y + p.dir.y * p.move_spd;

if (map[(int)p.pos.y][(int)next_x] != '1') p.pos.x = next_x;
if (map[(int)next_y][(int)p.pos.x] != '1') p.pos.y = next_y;

// rotate both dir and plane
old_dir_x = p.dir.x;
p.dir.x = p.dir.x * cos(a) - p.dir.y * sin(a);
p.dir.y = old_dir_x * sin(a) + p.dir.y * cos(a);

old_plane_x = p.plane.x;
p.plane.x = p.plane.x * cos(a) - p.plane.y * sin(a);
p.plane.y = old_plane_x * sin(a) + p.plane.y * cos(a);`}</pre>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">10) Debug checklist (how to not die in defense)</h2>
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-slate-300 space-y-3">
          <ul className="list-disc pl-5 space-y-2">
            <li>Print one column’s ray variables: cameraX, rayDir, mapX/Y, stepX/Y, deltaDist, sideDist, side.</li>
            <li>Verify map indexing: always <code className="text-slate-200">map[y][x]</code>.</li>
            <li>Clamp drawStart/drawEnd and avoid writing outside the image buffer.</li>
            <li>If textures look mirrored: check texX flipping conditions.</li>
            <li>If walls curve: you used Euclidean distance instead of perpWallDist.</li>
            <li>If you segfault: your map is open or you let DDA walk out-of-bounds.</li>
          </ul>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'Lock your structs early: player(dir+plane), ray (delta/side/step), image (addr/bpp/line_len).',
          'Validate the map as a CLOSED world; spaces are void.',
          'DDA: compare sideDistX vs sideDistY, step cell-by-cell, stop on wall.',
          'Use perpWallDist for projection; Euclidean causes fish-eye.',
        ]}
        commonMistakes={[
          'Parsing the map with trim() and losing spaces.',
          'Swapping map[x][y] and map[y][x].',
          'Not clamping drawStart/drawEnd (writes outside image).',
          'Rotating dir but forgetting to rotate plane.',
        ]}
        quiz={[
          'Why must a walkable tile never touch a space/void?',
          'What exactly do deltaDistX and deltaDistY represent?',
          'Why do we compute perpWallDist instead of the direct hit distance?',
          'What happens if you rotate dir but not plane?',
        ]}
      />
    </div>
  );
}
