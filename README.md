# Computer Graphics Course Demos

This repository contains 3D graphics demonstrations. 

## Projects

### Project 0: Camera (WebGL2)

A simple 3D camera demonstration using WebGL2. The camera can be rotated using the mouse. 

This is a copy of the code from [WebGL2 Fundamentals](https://webgl2fundamentals.org/webgl/lessons/webgl-3d-camera.html) with minor modifications to the HTML (added head and body tags, etc.) for deployment on GitHub Pages and no changes to the CSS and JavaScript files.

**link:** [Camera (WebGL2)](https://jiesli.github.io/computer-graphics-course-demos/proj0_camera_webgl2/)

### Project 1: Barn Field Interactive Scene (Three.js)

An interactive 3D scene featuring a green grassy field, a barn, and a tree. The scene includes a blue player character that can be controlled using keyboard input for movement. This project demonstrates 3D graphics programming using the Three.js library, a popular JavaScript 3D graphics framework.

**link:** [Barn Field Interactive Scene (Three.js)](https://jiesli.github.io/computer-graphics-course-demos/proj1_barn_field_interact_3js/)

### Project 2: Barn Field Interactive Scene (WebGL2)

A preliminary reimplementation of the same interactive 3D scene using WebGL2, providing a lower-level approach to 3D graphics rendering. This project demonstrates direct WebGL2 programming, including shader management, geometry handling, and matrix transformations, while maintaining the same visual elements and interactive controls as Project 1. [incomplete]

**link:** [Barn Field Interactive Scene (WebGL2)](https://jiesli.github.io/computer-graphics-course-demos/proj2_barn_field_interact_webgl2/)

## Local Development

To run the projects locally, 1. clone the repository:
```bash
git clone git@github.com:JieSLi/computer-graphics-course-demos.git
cd computer-graphics-course-demos
```

2. Run a web server to serve the projects. You can use VSCode Live Server or the following command to start a simple web server:
```bash
python -m http.server
```
Then, open your browser. If you are in the `computer-graphics-course-demos` directory, you can open the index page in your browser by navigating to `http://localhost:8000/index.html`.

## Repository Structure

```
computer-graphics-course-demos/
├── proj0_camera_webgl2/         # Project 0: Camera (WebGL2) implementation
├── proj1_barn_field_interact_3js/ # Project 1: Barn Field Interactive Scene (Three.js) implementation
├── proj2_barn_field_interact_webgl2/ # Project 2: Barn Field Interactive Scene (WebGL2) implementation
└── index.html                    # Project index page
```

## Contributors

The demos are mostly AI-generated, with a smidgen of human intervention. 
