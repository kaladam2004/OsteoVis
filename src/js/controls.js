
import * as THREE from 'three';

export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.target = new THREE.Vector3(0, 0, 0);
    this.spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(this.target));
    this.isDragging = false;
    this.isRightDrag = false;
    this.lastX = 0; this.lastY = 0;
    this.thetaVel = 0; this.phiVel = 0;
    this.panOffset = new THREE.Vector3();
    this.bindEvents();
  }
  bindEvents() {
    const el = this.domElement;
    el.addEventListener('mousedown', e => { this.isDragging=true; this.isRightDrag=e.button===2; this.lastX=e.clientX; this.lastY=e.clientY; });
    window.addEventListener('mouseup', () => this.isDragging=false);
    window.addEventListener('mousemove', e => {
      if(!this.isDragging) return;
      const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
      this.lastX = e.clientX; this.lastY = e.clientY;
      if(this.isRightDrag) {
        const speed = 0.002 * this.spherical.radius;
        const right = new THREE.Vector3(1,0,0).applyQuaternion(this.camera.quaternion);
        const up = new THREE.Vector3(0,1,0).applyQuaternion(this.camera.quaternion);
        this.panOffset.addScaledVector(right, -dx*speed).addScaledVector(up, dy*speed);
      } else {
        this.thetaVel -= dx * 0.005;
        this.phiVel -= dy * 0.005;
      }
    });
    el.addEventListener('wheel', e => { e.preventDefault(); this.spherical.radius *= (e.deltaY > 0 ? 1.1 : 0.9); }, {passive:false});
    el.addEventListener('contextmenu', e=>e.preventDefault());
    let lastTouchDist = 0;
    el.addEventListener('touchstart', e => {
      e.preventDefault();
      if(e.touches.length === 1) { this.isDragging=true; this.isRightDrag=false; this.lastX=e.touches[0].clientX; this.lastY=e.touches[0].clientY; }
      else if(e.touches.length === 2) { 
        lastTouchDist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
      }
    }, {passive:false});
    el.addEventListener('touchmove', e => {
      e.preventDefault();
      if(e.touches.length === 1 && this.isDragging) {
        const dx = e.touches[0].clientX - this.lastX, dy = e.touches[0].clientY - this.lastY;
        this.lastX = e.touches[0].clientX; this.lastY = e.touches[0].clientY;
        this.thetaVel -= dx * 0.005; this.phiVel -= dy * 0.005;
      } else if(e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        this.spherical.radius *= (lastTouchDist / dist);
        lastTouchDist = dist;
      }
    }, {passive:false});
    el.addEventListener('touchend', () => this.isDragging=false);
  }
  update() {
    this.spherical.theta += this.thetaVel;
    this.spherical.phi += this.phiVel;
    this.thetaVel *= 0.9; this.phiVel *= 0.9;
    this.spherical.phi = Math.max(0.05, Math.min(Math.PI - 0.05, this.spherical.phi));
    this.spherical.radius = Math.max(1.0, Math.min(15, this.spherical.radius));
    this.target.add(this.panOffset);
    this.panOffset.multiplyScalar(0.85);
    this.camera.position.setFromSpherical(this.spherical).add(this.target);
    this.camera.lookAt(this.target);
  }
}
