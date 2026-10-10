<template>
  <div class="cover" :class="{ leaving: isLeaving }">
    <div class="cover-bg" :class="{ zoom: isLeaving }">
      <svg class="campus-scene" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1a4a3f" />
            <stop offset="40%" stop-color="#2d6b56" />
            <stop offset="70%" stop-color="#3d8a6e" />
            <stop offset="100%" stop-color="#5ba884" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2d6b56" />
            <stop offset="100%" stop-color="#1a4a3f" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#sky)" />
        <ellipse cx="1500" cy="200" rx="300" ry="150" fill="#ffffff" opacity="0.06" />
        <ellipse cx="400" cy="150" rx="250" ry="120" fill="#ffffff" opacity="0.04" />
        <path d="M0,720 Q200,680 400,710 T800,700 T1200,715 T1600,690 T1920,705 L1920,1080 L0,1080 Z" fill="url(#ground)" opacity="0.9" />
        <g opacity="0.7">
          <path d="M100,720 L100,560 Q80,540 90,520 Q100,500 120,510 Q140,490 150,520 Q170,500 180,530 Q190,550 170,560 L170,720 Z" fill="#0d2e26" />
          <path d="M280,720 L280,600 Q260,580 270,560 Q280,540 300,550 Q320,530 330,560 Q350,540 360,570 Q370,590 350,600 L350,720 Z" fill="#0a2820" />
          <path d="M1650,720 L1650,540 Q1630,520 1640,500 Q1650,480 1670,490 Q1690,470 1700,500 Q1720,480 1730,510 Q1740,530 1720,540 L1720,720 Z" fill="#0d2e26" />
          <path d="M1820,720 L1820,580 Q1800,560 1810,540 Q1820,520 1840,530 Q1860,510 1870,540 Q1890,520 1900,550 Q1910,570 1890,580 L1890,720 Z" fill="#0a2820" />
        </g>
        <g opacity="0.85">
          <rect x="500" y="450" width="200" height="270" fill="#143830" rx="4" />
          <rect x="520" y="480" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="570" y="480" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="620" y="480" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="520" y="540" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="570" y="540" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="620" y="540" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="520" y="600" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="570" y="600" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="620" y="600" width="30" height="40" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="780" y="400" width="240" height="320" fill="#0d2e26" rx="4" />
          <rect x="800" y="430" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="850" y="430" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="900" y="430" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="955" y="430" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="800" y="500" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="850" y="500" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="900" y="500" width="35" height="45" fill="#3d8a6e" opacity="0.4" rx="2" />
          <rect x="955" y="500" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="800" y="570" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="850" y="570" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="900" y="570" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="955" y="570" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="800" y="640" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="850" y="640" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="900" y="640" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="955" y="640" width="35" height="45" fill="#2d6b56" opacity="0.5" rx="2" />
          <rect x="1100" y="480" width="180" height="240" fill="#143830" rx="4" />
          <rect x="1120" y="510" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1165" y="510" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1210" y="510" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1120" y="570" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1165" y="570" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1210" y="570" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1120" y="630" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1165" y="630" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
          <rect x="1210" y="630" width="28" height="36" fill="#2d6b56" opacity="0.6" rx="2" />
        </g>
        <g opacity="0.6">
          <path d="M1350,720 L1350,620 Q1330,600 1340,580 Q1350,560 1370,570 Q1390,550 1400,580 Q1420,560 1430,590 Q1440,610 1420,620 L1420,720 Z" fill="#0a2820" />
          <path d="M1480,720 L1480,650 Q1465,635 1472,620 Q1480,605 1495,612 Q1510,598 1518,620 Q1530,605 1538,630 Q1545,645 1530,650 L1530,720 Z" fill="#0d2e26" />
        </g>
        <g opacity="0.5">
          <rect x="600" y="710" width="700" height="8" fill="#3d8a6e" rx="4" />
          <rect x="580" y="718" width="740" height="6" fill="#2d6b56" rx="3" />
        </g>
        <g opacity="0.15" fill="#ffffff">
          <circle cx="200" cy="300" r="2" /><circle cx="350" cy="250" r="1.5" />
          <circle cx="500" cy="200" r="2" /><circle cx="700" cy="280" r="1.5" />
          <circle cx="900" cy="220" r="2" /><circle cx="1100" cy="260" r="1.5" />
          <circle cx="1300" cy="200" r="2" /><circle cx="1500" cy="280" r="1.5" />
          <circle cx="1700" cy="240" r="2" />
        </g>
      </svg>
      <div class="cover-overlay"></div>
    </div>

    <div class="cover-content" :class="{ leaving: isLeaving }">
      <div class="cover-tag">CAMPUS DELIVERY</div>
      <h1 class="cover-title">智云校遇</h1>
      <p class="cover-subtitle">让每一件快递，都有清晰的去向</p>
      <button class="enter-btn" @click="handleEnter" :class="{ glowing: isLeaving }">
        <span class="enter-btn-text">进入助手</span>
        <span class="enter-btn-arrow">→</span>
      </button>
    </div>

    <div class="light-beam" :class="{ active: isLeaving }"></div>
    <div class="cover-glow" :class="{ active: isLeaving }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ entered: [] }>()
const isLeaving = ref(false)

function handleEnter() {
  if (isLeaving.value) return
  isLeaving.value = true
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const delay = reduceMotion ? 100 : 800
  setTimeout(() => { emit('entered') }, delay)
}
</script>

<style scoped>
.cover { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: transform 0.8s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.6s ease 0.2s; }
.cover.leaving { transform: scaleX(0.02); opacity: 0; }
.cover-bg { position: absolute; inset: 0; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.cover-bg.zoom { transform: scale(1.08); }
.campus-scene { width: 100%; height: 100%; display: block; }
.cover-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(18, 63, 55, 0.72) 0%, rgba(21, 91, 76, 0.65) 50%, rgba(18, 63, 55, 0.78) 100%); }
.cover-content { position: relative; z-index: 10; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0; transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease, filter 0.5s ease; }
.cover-content.leaving { transform: scale(0.92); opacity: 0; filter: blur(8px); }
.cover-tag { font-family: var(--font-mono); font-size: 13px; letter-spacing: 4px; color: rgba(230, 243, 238, 0.7); margin-bottom: 24px; font-weight: 500; }
.cover-title { font-size: clamp(40px, 7vw, 68px); font-weight: 800; color: #FFFDF0; letter-spacing: 6px; text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3); margin-bottom: 20px; font-family: var(--font-sans); }
.cover-subtitle { font-size: clamp(15px, 2vw, 19px); color: rgba(230, 243, 238, 0.8); letter-spacing: 2px; margin-bottom: 48px; font-weight: 400; }
.enter-btn { display: inline-flex; align-items: center; gap: 12px; padding: 16px 56px; border-radius: 16px; background: linear-gradient(135deg, rgba(255, 253, 240, 0.18), rgba(230, 243, 238, 0.12)); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.35); color: #FFFDF0; font-size: 17px; font-weight: 600; letter-spacing: 3px; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 4px 24px rgba(0, 0, 0, 0.15); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
.enter-btn:hover { background: linear-gradient(135deg, rgba(255, 253, 240, 0.28), rgba(230, 243, 238, 0.18)); border-color: rgba(255, 255, 255, 0.5); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 6px 32px rgba(0, 0, 0, 0.2); transform: translateY(-2px); }
.enter-btn.glowing { box-shadow: 0 0 40px rgba(42, 157, 126, 0.8), 0 0 80px rgba(42, 157, 126, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35); }
.enter-btn-arrow { transition: transform 0.3s ease; font-size: 20px; }
.enter-btn:hover .enter-btn-arrow { transform: translateX(6px); }
.light-beam { position: fixed; top: 0; left: -100%; width: 100%; height: 100%; z-index: 20; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(230, 243, 238, 0.15), transparent); opacity: 0; }
.light-beam.active { animation: beamSweep 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
@keyframes beamSweep { 0% { left: -100%; opacity: 0; } 20% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
.cover-glow { position: fixed; inset: 0; z-index: 15; pointer-events: none; background: radial-gradient(circle at center, rgba(42, 157, 126, 0.3), transparent 60%); opacity: 0; }
.cover-glow.active { animation: glowPulse 0.8s ease forwards; }
@keyframes glowPulse { 0% { opacity: 0; } 40% { opacity: 1; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .cover, .cover-bg, .cover-content { transition: opacity 0.2s ease !important; } .cover.leaving { transform: none; } .cover-bg.zoom { transform: none; } .cover-content.leaving { transform: none; filter: none; } .light-beam.active, .cover-glow.active { animation: none !important; } }
@media (max-width: 768px) { .cover-title { letter-spacing: 4px; } .cover-subtitle { letter-spacing: 1px; margin-bottom: 36px; } .enter-btn { padding: 14px 40px; font-size: 15px; letter-spacing: 2px; } }
</style>