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
        this.zoomStep = 0.2; 

        this.eye = vec3(0.5, 0.5, this.zoom);
        this.at  = vec3(0.5, 0.5, 0.5);
        this.up  = vec3(0.0, 1.0, 0.0);
        
        this.setupEvents();
        this.setupButtonEvents(); 
    }

    setupButtonEvents() {
        const btnIn = document.getElementById('zoomIn');
        const btnOut = document.getElementById('zoomOut');

        if (btnIn) {
            btnIn.addEventListener('click', () => {
                this.applyZoom(this.zoomStep); 
            });
        }

        if (btnOut) {
            btnOut.addEventListener('click', () => {
                this.applyZoom(-this.zoomStep); 
            });
        }
    }

    applyZoom(amount) {
        this.zoom += amount;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom));
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => { this.isDragging = false; });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.rotationY += (e.clientX - this.lastMouseX) * 0.5; 
                this.rotationX += (e.clientY - this.lastMouseY) * 0.5; 
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault(); 
            const wheelSensitivity = 0.002;
            this.applyZoom(e.deltaY * -wheelSensitivity);
        }, { passive: false });
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