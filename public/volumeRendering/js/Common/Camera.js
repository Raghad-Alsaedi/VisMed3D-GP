export class Camera {
    constructor(canvas) {
        this.canvas = canvas;

        this.rotationX = 0;
        this.rotationY = 0;

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.zoom = -1.5;
        this.minZoom = -5.0;
        this.maxZoom = -0.1;

        this.eye = vec3(0.5, 0.5, this.zoom);
        this.at  = vec3(0.5, 0.5, 0.5);
        this.up  = vec3(0.0, 1.0, 0.0);

        this.setupEvents();
    }

    applyZoom(amount) {
        this.zoom += amount;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
    }

    setupEvents() {

        // ===== Mouse Drag Rotation =====
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            this.rotationY += (e.clientX - this.lastMouseX) * 0.3;
            this.rotationX += (e.clientY - this.lastMouseY) * 0.3;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        // ===== Mouse Wheel Zoom =====
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.applyZoom(e.deltaY * -0.002);
        }, { passive: false });

        // ===== Keyboard Rotation + Zoom (ARROWS + +/-) =====
        window.addEventListener("keydown", (e) => {

            const rotSpeed = 2.0;
            const zoomSpeed = 0.2;

            switch (e.key) {
                case "ArrowLeft":
                    this.rotationY -= rotSpeed;
                    break;

                case "ArrowRight":
                    this.rotationY += rotSpeed;
                    break;

                case "ArrowUp":
                    this.rotationX -= rotSpeed;
                    break;

                case "ArrowDown":
                    this.rotationX += rotSpeed;
                    break;

                case "+":
                case "=":
                    this.applyZoom(zoomSpeed);
                    break;

                case "-":
                    this.applyZoom(-zoomSpeed);
                    break;

                // Reset (اختياري)
                case "r":
                    this.rotationX = 0;
                    this.rotationY = 0;
                    this.zoom = -1.5;
                    break;
            }
        });
    }

    getModelMatrix() {
        let m = mat4();
        m = mult(m, translate(0.5, 0.5, 0.5));
        m = mult(m, rotate(this.rotationX, vec3(1, 0, 0)));
        m = mult(m, rotate(this.rotationY, vec3(0, 1, 0)));
        m = mult(m, translate(-0.5, -0.5, -0.5));
        return m;
    }

    getViewMatrix() {
        this.eye = vec3(0.5, 0.5, this.zoom);
        return lookAt(this.eye, this.at, this.up);
    }

    getProjectionMatrix() {
        return perspective(70.0, this.canvas.width / this.canvas.height, 0.1, 100.0);
    }
}
