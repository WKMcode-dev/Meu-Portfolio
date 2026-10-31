/* A tiny WebGL optical material, rendered only over the original WKM glyphs. */
(() => {
  const word = document.querySelector('.brand-word');
  if (!word) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'brand-prism';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
  if (!gl) return;
  const vertex = `attribute vec2 position; varying vec2 uv;
    void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
  const fragment = `precision mediump float;
    varying vec2 uv;
    uniform sampler2D glyph;
    uniform vec2 size;
    uniform vec2 pointer;
    uniform float time;
    uniform float lightTheme;
    float mask(vec2 p) { return texture2D(glyph,p).a; }
    float heightAt(vec2 p) {
      vec2 d=1.5/size;
      return (mask(p)*4.+mask(p+vec2(d.x,0.))+mask(p-vec2(d.x,0.))+
        mask(p+vec2(0.,d.y))+mask(p-vec2(0.,d.y)))/8.;
    }
    // A white slit light seen through a dispersive medium. Each wavelength
    // refracts at a different IOR (Cauchy approximation), then hits the light plane.
    float slit(vec3 ray, vec2 p, float phase) {
      vec2 q=p+ray.xy/max(abs(ray.z),.2)*2.2;
      float line=q.x*.52+q.y*.86;
      float distanceToLight=abs(sin(line*6.8+phase));
      return exp(-distanceToLight*distanceToLight*95.)+
        .18*exp(-distanceToLight*distanceToLight*8.);
    }
    void main(){
      float a=mask(uv);
      if(a<.01){ gl_FragColor=vec4(0.); return; }
      vec2 px=1./size;
      vec2 p=(uv-.5)*vec2(size.x/size.y,1.);
      vec2 slope=vec2(heightAt(uv+vec2(px.x,0.))-heightAt(uv-vec2(px.x,0.)),
                       heightAt(uv+vec2(0.,px.y))-heightAt(uv-vec2(0.,px.y)));
      // Cut planes stay fixed to the glass; the illumination travels across them.
      float cut=sin(p.x*9.+p.y*13.);
      vec2 facet=vec2(cut>.0?.28:-.22,cut>.0?-.22:.34);
      vec3 normal=normalize(vec3(-slope*5.+facet,1.));
      vec3 incident=normalize(vec3(.28*sin(time*.55)+pointer.x*.35,
        .42*cos(time*.4)+pointer.y*.3,-1.));
      float phase=time*.85;
      vec3 red=refract(incident,normal,1./1.45);
      vec3 green=refract(incident,normal,1./1.53);
      vec3 blue=refract(incident,normal,1./1.65);
      vec3 spectrum=vec3(slit(red,p,phase),slit(green,p,phase),slit(blue,p,phase));
      // Second internal bounce splits a broader caustic into separate colours.
      
      vec3 caustic=vec3(slit(red+normal*.22,p,-phase*.7+1.5),
        slit(green+normal*.30,p,-phase*.7+1.5),slit(blue+normal*.40,p,-phase*.7+1.5));
      float fresnel=pow(1.-max(normal.z,0.),3.);
      vec3 light=normalize(vec3(sin(time*.6)*.8+pointer.x,.6+pointer.y,1.1));
      float specular=pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),36.);
      float bevel=clamp(length(slope)*3.,0.,1.);
      vec3 body=mix(vec3(.055,.085,.12),vec3(.16,.20,.24),lightTheme);
      body+=vec3(.12,.16,.19)*max(dot(normal,light),0.);
      vec3 colour=body+spectrum*1.7+caustic*.8+specular*vec3(1.5,1.4,1.25);
      colour+=bevel*(vec3(.18,.25,.30)+spectrum*.6)+fresnel*.4;
      colour=1.-exp(-colour*1.35);
      gl_FragColor=vec4(colour,a);
    }`;
  const shaders = [];
  function compile(type, source) {
    const shader = gl.createShader(type);
    shaders.push(shader);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    shaders.forEach(shader => gl.deleteShader(shader));
    gl.deleteProgram(program);
    return;
  }
  shaders.forEach(shader => gl.deleteShader(shader));
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const uniforms = Object.fromEntries(['glyph','size','pointer','time','lightTheme'].map(name => [name,gl.getUniformLocation(program,name)]));
  gl.uniform1i(uniforms.glyph, 0);
  word.append(canvas);
  let ready = false, lost = false, inView = true, frame = 0, last = 0, elapsed = 1.4;
  let aim = [0,0], current = [0,0];
  const contrast = matchMedia('(forced-colors: active)');
  function render() {
    if (!ready || lost) return;
    gl.uniform2f(uniforms.size, canvas.width, canvas.height);
    gl.uniform2f(uniforms.pointer, current[0], current[1]);
    gl.uniform1f(uniforms.time, elapsed);
    gl.uniform1f(uniforms.lightTheme, document.documentElement.dataset.theme === 'light' ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function animate(now) {
    frame = requestAnimationFrame(animate);
    if (now-last < 32) return; // Cap to 30 fps; only a few thousand pixels.
    elapsed += Math.min((now-last)/1000,.05);
    last = now;
    current = current.map((value,i) => value+(aim[i]-value)*.08);
    render();
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0;
    word.classList.toggle('prism-active', ready && !lost && !contrast.matches);
    render(); gl.flush();
    if (ready && !lost && inView && !document.hidden && !contrast.matches && window.PortfolioSettings.get().motionAllowed) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  function resize() {
    if (lost) return;
    const style = getComputedStyle(word);
    const ratio = Math.min(devicePixelRatio || 1, 2);
    const w = word.offsetWidth, h = word.offsetHeight;
    if (!w || !h) return;
    canvas.width = Math.ceil(w*ratio); canvas.height = Math.ceil(h*ratio);
    const mask = document.createElement('canvas');
    mask.width=canvas.width; mask.height=canvas.height;
    const ctx=mask.getContext('2d');
    ctx.scale(ratio,ratio);
    ctx.font = style.fontWeight+' '+style.fontSize+' '+style.fontFamily;
    ctx.fillStyle='white';
    ctx.textBaseline='alphabetic';
    // Draw letters individually to retain the original tracking on older Safari.
    const text='WKM', tracking=parseFloat(style.letterSpacing)||0;
    const metrics=ctx.measureText(text);
    const ascent=metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
    const descent=metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
    const baseline=(h-ascent-descent)/2+ascent;
    ctx.scale(w/(metrics.width+tracking*(text.length-1)),1);
    let x=0;
    for(let i=0;i<text.length;i++) {
      if(i) x=ctx.measureText(text.slice(0,i)).width+tracking*i;
      ctx.fillText(text[i],x,baseline);
    }
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,mask);
    gl.viewport(0,0,canvas.width,canvas.height);
    ready=true; sync();
  }
  word.closest('.brand').addEventListener('pointermove', event => {
    const rect=word.getBoundingClientRect();
    aim=[Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1)),
      Math.max(-1,Math.min(1,1-(event.clientY-rect.top)/rect.height*2))];
  });
  word.closest('.brand').addEventListener('pointerleave',()=>{aim=[0,0];});
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault(); lost=true; sync();
  });
  // A lost context falls back to readable text until the next page load.
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('portfolio:settings',sync);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
  window.addEventListener('pageshow',sync);
  contrast.addEventListener('change',sync);
  new ResizeObserver(resize).observe(word);
  new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();}).observe(word);
  document.fonts.ready.then(resize);
})();
