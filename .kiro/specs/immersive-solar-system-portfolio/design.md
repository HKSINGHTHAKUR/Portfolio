# Design Document: Immersive Solar System Portfolio

## Overview

This design document outlines the technical architecture for transforming the Immersive Solar System Portfolio from a static navigation interface into a fully immersive experience. The focus is on building the complete transition and immersion architecture for the Projects planet as a proof-of-concept, establishing the pattern for replication across other worlds.

## Architecture

### Architecture Principles

1. **Modular World System**: Each world (Projects, About, Skills, Experience, Contact) is a self-contained module with consistent interfaces
2. **State-Driven Transitions**: Clear state management separates Navigation_State (Solar System) from Immersion_State (World Interior)
3. **Performance-First Design**: All visual effects use GPU-accelerated procedural shaders and optimized particle systems
4. **Cinematic Choreography**: Camera movement, atmospheric effects, and UI reveals are precisely timed and coordinated
5. **Reusable Patterns**: The Projects world implementation establishes patterns that scale to other worlds without modification

## System Architecture

### 1. World Transition Controller

**Purpose**: Orchestrates all state transitions between Solar System and World Interiors

**Responsibilities**:
- Manage Navigation_State ↔ Immersion_State transitions
- Coordinate camera movement, atmospheric effects, and UI reveals
- Handle loading and unloading of world assets
- Manage input blocking during transitions

**Key Methods**:
```
enterWorld(planetId: string, targetWorld: WorldConfig)
  - Initiate Cinematic_Camera_Travel
  - Trigger Atmospheric_Effects intensification
  - Pre-load world assets during travel
  - Activate Portal_Transition at destination
  - Transition to Immersion_State

exitWorld()
  - Initiate reverse Cinematic_Camera_Travel
  - Fade out World_Interior environment
  - Restore Solar_System visibility
  - Transition to Navigation_State
```

**State Machine**:
```
Navigation_State
  ↓ (user clicks planet)
Traveling_State (2-4 seconds)
  ↓ (camera reaches planet)
Portal_Transition_State (0.5-1.5 seconds)
  ↓ (transition completes)
Immersion_State
  ↓ (user clicks return)
Reverse_Traveling_State (2-4 seconds)
  ↓ (camera reaches Solar System)
Navigation_State
```

### 2. Planet Expansion System

**Purpose**: Smoothly scale planets and intensify atmospheric effects as camera approaches

**Components**:

#### 2.1 Planet Scale Animation
- **Trigger**: When Cinematic_Camera_Travel begins
- **Duration**: 2-4 seconds (matches camera travel)
- **Easing**: Smooth ease-out curve
- **Target Scale**: From current size to fill viewport (approximately 3-5× current size)
- **Implementation**: GPU-accelerated transform animation using Three.js Tween or custom animation system

#### 2.2 Atmospheric Effect Intensification
- **Particle Density**: Increase from baseline to peak over travel duration
  - Baseline: 2,000-3,000 particles
  - Peak: 8,000-10,000 particles
  - Scaling: Linear interpolation based on camera distance
  
- **Bloom Intensity**: Increase from 0.5 to 1.5 over travel duration
  - Controlled via postprocessing pass
  - Smooth continuous increase
  
- **Lighting Shift**: Transition planet lighting to emphasize its unique theme
  - Baseline: Ambient lighting from Solar System
  - Peak: Planet-specific directional lighting
  - Color shift: Gradual transition to planet's color palette

#### 2.3 Background Fade
- **Solar System Fade**: Decrease opacity from 1.0 to 0.1 over travel duration
- **Nebula Fade**: Reduce nebula shader intensity proportionally
- **Star Field Fade**: Reduce star visibility to focus on destination planet

### 3. Immersion Transition System

**Purpose**: Create a distinctive visual boundary between Solar System and World Interior

**Portal Transition Effect** (0.5-1.5 seconds):

#### 3.1 Atmospheric Distortion
- **Technique**: Screen-space distortion shader
- **Effect**: Subtle warping around screen center
- **Intensity Curve**: Ease-in-out (slow start, peak middle, slow end)
- **Color Shift**: Transition from planet's atmospheric color to world interior color palette

#### 3.2 Fog Intensification
- **Fog Density**: Increase from 0.3 to 0.8 over transition
- **Fog Color**: Shift from planet's color to world interior's color
- **Effect**: Creates sense of entering a dense environment

#### 3.3 Light Bloom Transition
- **Bloom Intensity**: Peak at transition midpoint (1.8), then settle to world interior baseline (1.2)
- **Bloom Color**: Shift to match world interior's lighting theme
- **Effect**: Creates sense of energy release when crossing threshold

#### 3.4 Chromatic Aberration (Subtle)
- **Intensity**: 0.01-0.02 (very subtle)
- **Duration**: Full transition duration
- **Effect**: Adds visual interest without feeling cheap

#### 3.5 Environment Fade
- **Solar System Fade Out**: 0 → 1 opacity over transition
- **World Interior Fade In**: 1 → 0 opacity over transition
- **Crossfade Point**: 50% through transition

### 4. Projects World Environment Design

**Visual Theme**: Holographic Engineering Chamber

**Mood**: Futuristic, elite, technical, atmospheric, premium

**Inspiration**: Iron Man interfaces, sci-fi command centers, futuristic engineering labs

#### 4.1 Environment Structure

**Spatial Layout**:
- **Central Chamber**: Main viewing area where user enters
- **Holographic Panels**: Floating project display nodes arranged in 3D space
- **Atmospheric Layers**: Depth-creating visual elements at various distances
- **Lighting Rigs**: Strategic light sources creating cinematic depth

**Dimensions**:
- **Chamber Width**: 40 units
- **Chamber Height**: 30 units
- **Chamber Depth**: 50 units
- **Viewing Distance**: 15-20 units from chamber center

#### 4.2 Holographic UI System

**Design Language**:
- **Color Palette**: Cyan (#00FFFF), Electric Blue (#0080FF), Deep Indigo (#1A0033), Violet (#8B00FF)
- **Glow Effect**: Bloom + emissive materials
- **Transparency**: 0.7-0.9 opacity for holographic feel
- **Edge Glow**: Subtle outline effect on interactive elements

**Panel Components**:
- **Project Title**: Large, glowing text
- **Tech Stack**: Smaller text, color-coded by technology
- **Metrics**: Visual indicators (stars, completion %, etc.)
- **Interactive Zones**: Clickable areas for GitHub, live demo, details

**Panel Styling**:
```
Material Properties:
- emissive: Cyan/Blue based on panel type
- emissiveIntensity: 0.8-1.2
- transparent: true
- opacity: 0.85
- wireframe: false (but edge glow creates wireframe appearance)

Geometry:
- Rounded rectangles (0.5 unit corner radius)
- Slight 3D depth (0.2 units)
- Subtle bevel on edges
```

#### 4.3 Atmospheric Depth System

**Layered Particle Systems**:

1. **Foreground Particles** (closest to camera)
   - Density: 1,000-1,500 particles
   - Size: 0.1-0.3 units
   - Color: Bright cyan with high opacity
   - Speed: Slow drift (0.5-1.0 units/sec)
   - Purpose: Creates sense of immersion

2. **Mid-Ground Particles** (middle distance)
   - Density: 2,000-2,500 particles
   - Size: 0.05-0.15 units
   - Color: Electric blue with medium opacity
   - Speed: Medium drift (0.2-0.5 units/sec)
   - Purpose: Fills space, creates depth

3. **Background Particles** (far distance)
   - Density: 1,500-2,000 particles
   - Size: 0.02-0.08 units
   - Color: Deep indigo with low opacity
   - Speed: Slow drift (0.1-0.3 units/sec)
   - Purpose: Creates atmospheric haze

**Procedural Fog**:
- **Fog Type**: Exponential fog
- **Fog Color**: Deep indigo (#1A0033) with slight cyan tint
- **Fog Density**: 0.08-0.12 (adjustable based on performance)
- **Effect**: Creates sense of depth and mystery

#### 4.4 Lighting Design

**Key Lights**:
1. **Primary Directional Light** (from upper-left)
   - Intensity: 1.2
   - Color: Cyan (#00FFFF)
   - Shadow: Soft shadows with 0.5 opacity
   - Purpose: Main illumination, creates dramatic shadows

2. **Secondary Directional Light** (from lower-right)
   - Intensity: 0.6
   - Color: Violet (#8B00FF)
   - Shadow: No shadow
   - Purpose: Fill light, adds color richness

3. **Ambient Light**
   - Intensity: 0.4
   - Color: Deep indigo (#1A0033)
   - Purpose: Ensures no pure black areas

4. **Point Lights** (around holographic panels)
   - Intensity: 0.8-1.0 per light
   - Color: Cyan or Electric Blue (matching panel)
   - Range: 15-20 units
   - Purpose: Highlights panels, creates glow

**Bloom Effect**:
- **Threshold**: 0.8 (only bright areas bloom)
- **Strength**: 1.5
- **Radius**: 0.8
- **Effect**: Creates ethereal glow around bright elements

#### 4.5 Camera Positioning

**Entry Position** (end of Portal_Transition):
- **Position**: (0, 8, -15) relative to chamber center
- **Look At**: (0, 5, 0) — slightly above center
- **FOV**: 75 degrees
- **Near Clip**: 0.1
- **Far Clip**: 1000

**Framing**:
- Holographic panels visible in viewport
- Chamber architecture visible
- Sense of standing in the center of the environment

### 5. Project Display System

**Purpose**: Present projects in an immersive, interactive format

#### 5.1 Project Node Architecture

**Data Structure**:
```typescript
interface ProjectNode {
  id: string
  title: string
  description: string
  technologies: string[]
  metrics: {
    stars?: number
    completion?: number
    impact?: string
  }
  links: {
    github?: string
    demo?: string
    details?: string
  }
  position: Vector3
  color: Color
}
```

#### 5.2 Spatial Arrangement

**Grid Layout** (3 projects visible initially):
- **Project 1**: (-8, 5, 5) — Left panel
- **Project 2**: (0, 5, 10) — Center panel (closest)
- **Project 3**: (8, 5, 5) — Right panel

**Interaction**:
- **Hover**: Panel scales up 1.1×, glow intensifies
- **Click**: Panel moves to center, details expand
- **Navigation**: Scroll or arrow keys to view more projects

#### 5.3 Panel Interaction States

**Idle State**:
- Scale: 1.0
- Opacity: 0.85
- Glow: Baseline
- Rotation: Slight tilt (±5 degrees) for visual interest

**Hover State**:
- Scale: 1.1
- Opacity: 0.95
- Glow: +0.3 intensity
- Rotation: Straighten to 0 degrees
- Transition: 0.3 seconds ease-out

**Active State** (clicked):
- Scale: 1.3
- Position: Move to center (0, 5, 8)
- Opacity: 1.0
- Glow: +0.6 intensity
- Details: Expand to show full information
- Transition: 0.5 seconds ease-out

### 6. Performance Optimization Strategy

#### 6.1 Particle System Optimization

**GPU-Based Rendering**:
- Use Three.js Points geometry with custom shader
- Particle data stored in texture (position, velocity, lifetime)
- Update via compute shader or vertex shader animation
- Culling: Frustum culling + distance-based LOD

**Memory Management**:
- Pre-allocate particle buffer (max 10,000 particles)
- Reuse particles via lifetime system
- No dynamic allocation during runtime

**Density Scaling**:
- Monitor frame time
- If frame time > 16.67ms (60fps target):
  - Reduce particle count by 20%
  - Reduce bloom radius by 10%
  - Reduce postprocessing passes
- If frame time < 14ms:
  - Increase particle count by 10%
  - Increase bloom intensity by 5%

#### 6.2 Shader Optimization

**Procedural Shaders**:
- Use low-complexity noise functions (Perlin noise, not Simplex)
- Limit noise octaves to 3-4
- Pre-compute expensive calculations in vertex shader
- Use texture lookups for complex functions

**Postprocessing**:
- Limit to 2-3 passes per frame
- Use half-resolution for bloom pass
- Combine color grading and bloom in single pass when possible

#### 6.3 Asset Loading Strategy

**Pre-loading**:
- Load world assets during Portal_Transition (0.5-1.5 seconds available)
- Use progressive loading: geometry first, textures second, shaders third
- Show loading indicator if assets not ready by transition end

**Memory Management**:
- Unload Solar System assets when entering world
- Unload world assets when returning to Solar System
- Keep only active world in memory

#### 6.4 LOD (Level of Detail) System

**Particle System LOD**:
- High: 10,000 particles, full complexity
- Medium: 6,000 particles, reduced complexity
- Low: 3,000 particles, simple system

**Shader LOD**:
- High: Full procedural effects, all postprocessing
- Medium: Simplified procedural effects, reduced postprocessing
- Low: Basic effects, minimal postprocessing

**Automatic Selection**:
- Detect GPU capability at startup
- Monitor frame time during experience
- Adjust LOD dynamically

### 7. File Structure and Component Organization

```
src/components/
├── canvas/
│   ├── core/
│   │   ├── Experience.tsx (main orchestrator)
│   │   ├── Scene.tsx
│   │   └── CameraRig.tsx
│   ├── navigation/
│   │   ├── WorldTransitionController.tsx (state machine)
│   │   └── TravelController.tsx (camera movement)
│   ├── worlds/
│   │   ├── ProjectsWorld.tsx (main world component)
│   │   ├── ProjectsTransition.tsx (portal effect)
│   │   ├── HolographicPanel.tsx (reusable panel)
│   │   ├── ProjectNode.tsx (individual project)
│   │   └── WorldEnvironment.tsx (atmosphere, lighting, particles)
│   └── environment/
│       ├── Nebula.tsx (existing)
│       ├── Starfield.tsx (existing)
│       └── [other existing components]
├── systems/
│   ├── WorldTransitionController.ts (logic layer)
│   ├── ParticleSystem.ts (GPU particle management)
│   ├── PortalTransitionShader.ts (transition effect)
│   └── HolographicUISystem.ts (UI styling and interaction)
└── types/
    ├── world.ts (world interfaces)
    ├── project.ts (project data structures)
    └── effects.ts (effect configurations)
```

### 8. State Management

**Global State** (using Zustand or Context):
```typescript
interface AppState {
  // Navigation
  currentState: 'navigation' | 'traveling' | 'portal_transition' | 'immersion'
  activePlanet: string | null
  
  // Performance
  performanceLevel: 'high' | 'medium' | 'low'
  frameTime: number
  
  // World
  activeWorld: WorldConfig | null
  worldAssets: Map<string, AssetBundle>
  
  // Actions
  enterWorld: (planetId: string) => void
  exitWorld: () => void
  updatePerformance: (frameTime: number) => void
}
```

### 9. Animation Timing and Choreography

**Complete Transition Timeline** (6-8 seconds total):

```
0.0s - User clicks planet
  ├─ Cinematic_Camera_Travel begins (2-4s)
  ├─ Planet scale animation begins
  ├─ Atmospheric effects intensify
  └─ World assets pre-load

2-4s - Camera reaches planet
  ├─ Portal_Transition begins (0.5-1.5s)
  ├─ Atmospheric distortion activates
  ├─ Fog intensifies
  ├─ Light bloom peaks
  └─ Environment crossfade

2.5-5.5s - Portal_Transition completes
  ├─ World_Interior fully visible
  ├─ Holographic panels fade in
  ├─ Lighting settles to world interior baseline
  └─ User can interact with world

6-8s - Experience stabilizes
  ├─ All animations complete
  ├─ Immersion_State active
  └─ User can navigate world
```

### 10. Interaction Design

**Mouse/Touch Interactions**:
- **Hover**: Panels respond with scale and glow changes
- **Click**: Panels move to center, details expand
- **Scroll**: Navigate through project list
- **Return Button**: Visible in corner, returns to Solar System

**Keyboard Shortcuts**:
- **ESC**: Return to Solar System
- **Arrow Keys**: Navigate between projects
- **Enter**: Expand selected project

### 11. Fallback and Accessibility

**WebGL Fallback**:
- If WebGL not available: Display static HTML portfolio
- Maintain all content and navigation
- Graceful degradation

**Performance Fallback**:
- If frame rate drops below 30fps: Reduce to low LOD
- If still below 30fps: Disable postprocessing
- If still below 30fps: Disable particle systems
- If still below 30fps: Switch to static rendering

**Accessibility**:
- Ensure all interactive elements are keyboard accessible
- Provide text alternatives for visual effects
- Support screen readers for content

## Components and Interfaces

### Core Components

#### WorldTransitionController
**Purpose**: Manages state transitions and orchestrates all transition effects

**Interface**:
```typescript
class WorldTransitionController {
  enterWorld(planetId: string, worldConfig: WorldConfig): Promise<void>
  exitWorld(): Promise<void>
  getCurrentState(): TransitionState
  isTransitioning(): boolean
}
```

#### TravelController
**Purpose**: Handles camera movement and animation

**Interface**:
```typescript
class TravelController {
  travelToTarget(target: Vector3, duration: number): Promise<void>
  travelFromTarget(origin: Vector3, duration: number): Promise<void>
  getCurrentPosition(): Vector3
  getCurrentProgress(): number
}
```

#### ProjectsWorld
**Purpose**: Main world component containing all Projects world elements

**Props**:
```typescript
interface ProjectsWorldProps {
  isActive: boolean
  onReturn: () => void
  projects: ProjectNode[]
}
```

#### HolographicPanel
**Purpose**: Reusable holographic UI panel component

**Props**:
```typescript
interface HolographicPanelProps {
  title: string
  content: string
  position: Vector3
  color: Color
  onHover?: () => void
  onClick?: () => void
  isActive?: boolean
}
```

#### WorldEnvironment
**Purpose**: Manages atmosphere, lighting, and particle systems

**Interface**:
```typescript
class WorldEnvironment {
  initialize(): void
  update(deltaTime: number): void
  setIntensity(intensity: number): void
  dispose(): void
}
```

### Shader Components

#### PortalTransitionShader
**Purpose**: Screen-space distortion and crossfade effect

**Uniforms**:
```glsl
uniform float uProgress;        // 0.0 to 1.0
uniform float uDistortion;      // Distortion intensity
uniform vec3 uFromColor;        // Starting color
uniform vec3 uToColor;          // Ending color
uniform sampler2D uTexture;     // Input texture
```

#### HolographicPanelShader
**Purpose**: Glowing holographic panel material

**Uniforms**:
```glsl
uniform vec3 uColor;            // Panel color
uniform float uGlowIntensity;   // Glow strength
uniform float uTime;            // Animation time
uniform float uOpacity;         // Panel opacity
```

#### ParticleShader
**Purpose**: GPU-based particle rendering and animation

**Uniforms**:
```glsl
uniform sampler2D uPositionTexture;
uniform sampler2D uVelocityTexture;
uniform float uTime;
uniform float uDeltaTime;
uniform vec3 uColor;
uniform float uSize;
```

## Data Models

### World Configuration
```typescript
interface WorldConfig {
  id: string
  name: string
  planetId: string
  environment: EnvironmentConfig
  camera: CameraConfig
  lighting: LightingConfig
  particles: ParticleSystemConfig[]
  assets: AssetBundle
}

interface EnvironmentConfig {
  fogColor: Color
  fogDensity: number
  backgroundColor: Color
  ambientIntensity: number
}

interface CameraConfig {
  position: Vector3
  lookAt: Vector3
  fov: number
  near: number
  far: number
}

interface LightingConfig {
  directionalLights: DirectionalLightConfig[]
  pointLights: PointLightConfig[]
  ambientLight: AmbientLightConfig
}

interface DirectionalLightConfig {
  color: Color
  intensity: number
  position: Vector3
  castShadow: boolean
  shadowMapSize: number
}

interface PointLightConfig {
  color: Color
  intensity: number
  position: Vector3
  range: number
}

interface AmbientLightConfig {
  color: Color
  intensity: number
}
```

### Project Data Structure
```typescript
interface ProjectNode {
  id: string
  title: string
  description: string
  technologies: Technology[]
  metrics: ProjectMetrics
  links: ProjectLinks
  position: Vector3
  color: Color
  thumbnail?: string
}

interface Technology {
  name: string
  category: 'frontend' | 'backend' | 'devops' | 'design'
  color: Color
}

interface ProjectMetrics {
  stars?: number
  completion?: number
  impact?: string
  timeline?: string
}

interface ProjectLinks {
  github?: string
  demo?: string
  details?: string
}
```

### Particle System Configuration
```typescript
interface ParticleSystemConfig {
  name: string
  maxParticles: number
  emissionRate: number
  lifetime: number
  size: Vector2
  color: Color
  opacity: number
  velocity: Vector3
  acceleration: Vector3
  position: Vector3
}
```

### Transition State
```typescript
type TransitionState = 
  | 'navigation'
  | 'traveling'
  | 'portal_transition'
  | 'immersion'
  | 'reverse_traveling'

interface TransitionContext {
  state: TransitionState
  progress: number
  sourcePlanet?: string
  targetWorld?: WorldConfig
  startTime: number
  duration: number
}
```

## Correctness Properties

### Property 1: State Consistency
**Definition**: The application SHALL maintain exactly one active state at any time, and transitions between states SHALL be atomic.

**Verification**:
- At any point in time, `currentState` SHALL have exactly one value
- State transitions SHALL complete fully before accepting new transitions
- No intermediate states where multiple state behaviors are active

### Property 2: Camera Continuity
**Definition**: Camera movement SHALL be smooth and continuous, with no jumps or discontinuities.

**Verification**:
- Camera position SHALL change smoothly over time
- Camera velocity SHALL not exceed configured maximum
- No frame-to-frame position jumps > 0.1 units

### Property 3: Performance Stability
**Definition**: Frame rate SHALL remain above 50fps during all transitions and above 55fps during normal immersion.

**Verification**:
- Frame time SHALL not exceed 20ms during transitions
- Frame time SHALL not exceed 18ms during immersion
- No frame drops below 50fps during critical sequences

### Property 4: Asset Loading Completion
**Definition**: World assets SHALL be fully loaded before user interaction is enabled.

**Verification**:
- All geometry, textures, and shaders loaded before Portal_Transition completes
- Loading indicator shown if assets not ready by transition end
- User cannot interact with world until all assets loaded

### Property 5: Visual Effect Consistency
**Definition**: All visual effects SHALL match their configured parameters and respond consistently to input.

**Verification**:
- Particle density matches configured values ±5%
- Bloom intensity matches configured values ±10%
- Color values match configured palette within ±5% tolerance

### Property 6: Input Responsiveness
**Definition**: User input SHALL be processed within 100ms of user action.

**Verification**:
- Click detection latency < 100ms
- Hover state updates < 50ms
- Panel interaction response < 100ms

## Error Handling

### Network Errors
- **Asset Loading Failure**: Display fallback geometry, continue with reduced visual quality
- **Shader Compilation Failure**: Use basic material, log error, continue
- **Timeout**: Show loading indicator, retry up to 3 times, then fallback

### Performance Errors
- **Frame Rate Drop**: Automatically reduce LOD, disable non-essential effects
- **Memory Pressure**: Unload inactive worlds, reduce particle counts
- **GPU Timeout**: Switch to CPU rendering, reduce visual complexity

### State Errors
- **Invalid State Transition**: Log error, remain in current state, prevent action
- **Orphaned State**: Reset to Navigation_State, clear all pending transitions
- **Concurrent Transitions**: Queue second transition, execute after first completes

### User Interaction Errors
- **Click During Transition**: Ignore input, prevent state corruption
- **Rapid Clicks**: Debounce input, process only first click
- **Invalid Panel Interaction**: Gracefully ignore, maintain current state

## Testing Strategy

### Unit Tests
- **State Machine**: Verify all state transitions are valid
- **Camera Movement**: Verify smooth interpolation and timing
- **Particle System**: Verify particle count and lifecycle
- **Shader Compilation**: Verify all shaders compile without errors

### Integration Tests
- **Full Transition Flow**: User clicks planet → enters world → returns to Solar System
- **Asset Loading**: Verify assets load during transition
- **Performance**: Verify frame rate maintained during transitions
- **State Consistency**: Verify state remains consistent through full cycle

### Performance Tests
- **Frame Rate**: Measure FPS during all transitions
- **Memory Usage**: Measure memory before/after world load
- **GPU Utilization**: Measure GPU load during particle rendering
- **Load Time**: Measure time to fully load world

### Visual Tests
- **Effect Quality**: Verify visual effects match design specifications
- **Color Accuracy**: Verify colors match configured palette
- **Lighting**: Verify lighting creates intended mood
- **Particle Behavior**: Verify particles behave as designed

### Accessibility Tests
- **Keyboard Navigation**: Verify all interactions work via keyboard
- **Screen Reader**: Verify content readable by screen readers
- **Fallback Rendering**: Verify fallback interface is functional
- **Color Contrast**: Verify sufficient contrast for visibility

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Implement WorldTransitionController state machine
- [ ] Create TravelController for camera movement
- [ ] Build basic ProjectsWorld component structure
- [ ] Implement Portal_Transition shader

### Phase 2: Environment (Week 2)
- [ ] Create holographic panel system
- [ ] Implement particle systems (3 layers)
- [ ] Set up lighting rig
- [ ] Create procedural fog system

### Phase 3: Interaction (Week 3)
- [ ] Implement project node interaction
- [ ] Create project detail expansion
- [ ] Build return navigation
- [ ] Add keyboard shortcuts

### Phase 4: Polish (Week 4)
- [ ] Performance optimization and LOD system
- [ ] Visual refinement and tweaking
- [ ] Accessibility implementation
- [ ] Testing and bug fixes

## Success Criteria

1. ✓ Projects world fully immersive and interactive
2. ✓ Smooth 60fps performance on target hardware
3. ✓ Cinematic transitions feel premium and intentional
4. ✓ Holographic UI feels cohesive and futuristic
5. ✓ Pattern established for replication to other worlds
6. ✓ All requirements from requirements.md satisfied
