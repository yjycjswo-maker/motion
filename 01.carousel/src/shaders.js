// 카드 셰이더: 단색 면 + 둥근 모서리(SDF) + 테두리.
export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const fragmentShader = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;        // 카드 면 색 (sRGB 그대로)
uniform float uCardAspect;  // 카드 가로/세로
uniform float uRadius;      // 모서리 반지름 (카드 높이 = 1 기준)
uniform float uBorderWidth; // 테두리 굵기 (px)
uniform vec3 uBorderColor;  // 테두리 색 (sRGB 그대로)
uniform float uBorderAlpha; // 테두리 투명도 (카드 위에 over 합성)

void main() {
    // 둥근 사각형 SDF. 단위는 카드 높이. d < 0 이 카드 안쪽.
    vec2 p = (vUv - 0.5) * vec2(uCardAspect, 1.0);
    vec2 b = vec2(uCardAspect * 0.5, 0.5) - uRadius;
    vec2 q = abs(p) - b;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float aa = fwidth(d); // 화면 1px 에 해당하는 d 변화량

    float edge = 1.0 - smoothstep(-aa, aa, d); // 카드 바깥은 0

    // 가장자리 안쪽 uBorderWidth px 띠에 테두리를 카드 위에 겹침
    float bw = uBorderWidth * aa;
    float border = (1.0 - smoothstep(bw - aa, bw + aa, -d)) * step(0.001, uBorderWidth);
    float ba = uBorderAlpha * border;
    vec3 outRgb = mix(uColor, uBorderColor, ba);

    gl_FragColor = vec4(outRgb, edge);
}
`
