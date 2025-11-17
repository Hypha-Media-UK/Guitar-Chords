import { w as head } from "../../chunks/index.js";
import { a as ssr_context } from "../../chunks/context.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
const chords = [
  // ===== MAJOR CHORDS =====
  {
    id: 1,
    name: "A",
    diagram: [
      ["o", "2", "2", "2", "o", "x"],
      // x-0-2-2-2-0
      ["", "3", "2", "1", "", ""]
    ]
  },
  {
    id: 3,
    name: "C",
    diagram: [
      ["o", "1", "o", "2", "3", "x"],
      // x-3-2-0-1-0
      ["", "1", "", "2", "3", ""]
    ]
  },
  {
    id: 4,
    name: "D",
    diagram: [
      ["2", "3", "2", "o", "x", "x"],
      // x-x-0-2-3-2
      ["2", "3", "1", "", "", ""]
    ]
  },
  {
    id: 6,
    name: "E",
    diagram: [
      ["o", "o", "1", "2", "2", "o"],
      // 0-2-2-1-0-0
      ["", "", "1", "3", "2", ""]
    ]
  },
  {
    id: 8,
    name: "F",
    diagram: [
      ["1", "1", "2", "3", "3", "1"],
      // 1-3-3-2-1-1
      ["1", "1", "2", "4", "3", "1"]
    ]
  },
  {
    id: 9,
    name: "G",
    diagram: [
      ["3", "o", "o", "o", "2", "3"],
      // 3-2-0-0-0-3
      ["4", "", "", "", "2", "3"]
    ]
  },
  {
    id: 26,
    name: "B",
    diagram: [
      ["2", "4", "4", "4", "2", "x"],
      // x-2-4-4-4-2
      ["1", "3", "3", "3", "1", ""]
    ]
  },
  // ===== MINOR CHORDS =====
  {
    id: 2,
    name: "Am",
    diagram: [
      ["o", "1", "2", "2", "o", "x"],
      // x-0-2-2-1-0
      ["", "1", "3", "2", "", ""]
    ]
  },
  {
    id: 5,
    name: "Dm",
    diagram: [
      ["1", "3", "2", "o", "x", "x"],
      // x-x-0-2-3-1
      ["1", "3", "2", "", "", ""]
    ]
  },
  {
    id: 7,
    name: "Em",
    diagram: [
      ["o", "o", "o", "2", "2", "o"],
      // 0-2-2-0-0-0
      ["", "", "", "2", "3", ""]
    ]
  },
  {
    id: 27,
    name: "Cm",
    diagram: [
      ["3", "4", "5", "5", "3", "x"],
      // x-3-5-5-4-3
      ["1", "2", "4", "3", "1", ""]
    ]
  },
  {
    id: 28,
    name: "Fm",
    diagram: [
      ["1", "1", "1", "3", "3", "1"],
      // 1-3-3-1-1-1
      ["1", "1", "1", "4", "3", "1"]
    ]
  },
  {
    id: 16,
    name: "Bm",
    diagram: [
      ["2", "3", "4", "4", "2", "x"],
      // x-2-4-4-3-2
      ["1", "2", "4", "3", "1", ""]
    ]
  },
  {
    id: 29,
    name: "Gm",
    diagram: [
      ["3", "3", "3", "5", "5", "3"],
      // 3-5-5-3-3-3
      ["1", "1", "1", "4", "3", "1"]
    ]
  },
  // ===== DOMINANT 7TH CHORDS =====
  {
    id: 10,
    name: "A7",
    diagram: [
      ["o", "2", "o", "2", "o", "x"],
      // x-0-2-0-2-0
      ["", "3", "", "2", "", ""]
    ]
  },
  {
    id: 11,
    name: "B7",
    diagram: [
      ["2", "o", "2", "1", "2", "x"],
      // x-2-1-2-0-2
      ["4", "", "3", "1", "2", ""]
    ]
  },
  {
    id: 12,
    name: "C7",
    diagram: [
      ["o", "1", "3", "2", "3", "x"],
      // x-3-2-3-1-0
      ["", "1", "4", "2", "3", ""]
    ]
  },
  {
    id: 13,
    name: "D7",
    diagram: [
      ["2", "1", "2", "o", "x", "x"],
      // x-x-0-2-1-2
      ["3", "1", "2", "", "", ""]
    ]
  },
  {
    id: 14,
    name: "E7",
    diagram: [
      ["o", "o", "1", "2", "o", "o"],
      // 0-2-0-1-0-0
      ["", "", "1", "2", "", ""]
    ]
  },
  {
    id: 30,
    name: "F7",
    diagram: [
      ["1", "1", "2", "1", "3", "1"],
      // 1-3-1-2-1-1
      ["1", "1", "2", "1", "3", "1"]
    ]
  },
  {
    id: 15,
    name: "G7",
    diagram: [
      ["1", "o", "o", "o", "2", "3"],
      // 3-2-0-0-0-1
      ["1", "", "", "", "2", "3"]
    ]
  },
  // ===== MAJOR 7TH CHORDS =====
  {
    id: 31,
    name: "Amaj7",
    diagram: [
      ["o", "2", "1", "2", "o", "x"],
      // x-0-2-1-2-0
      ["", "3", "1", "2", "", ""]
    ]
  },
  {
    id: 34,
    name: "Bmaj7",
    diagram: [
      ["2", "4", "3", "4", "2", "x"],
      // x-2-4-3-4-2
      ["1", "4", "2", "3", "1", ""]
    ]
  },
  {
    id: 18,
    name: "Cmaj7",
    diagram: [
      ["o", "o", "o", "2", "3", "x"],
      // x-3-2-0-0-0
      ["", "", "", "2", "3", ""]
    ]
  },
  {
    id: 32,
    name: "Dmaj7",
    diagram: [
      ["2", "2", "2", "o", "x", "x"],
      // x-x-0-2-2-2
      ["3", "2", "1", "", "", ""]
    ]
  },
  {
    id: 33,
    name: "Emaj7",
    diagram: [
      ["o", "o", "1", "1", "2", "o"],
      // 0-2-1-1-0-0
      ["", "", "3", "1", "2", ""]
    ]
  },
  {
    id: 17,
    name: "Fmaj7",
    diagram: [
      ["o", "1", "2", "3", "3", "x"],
      // x-3-3-2-1-0
      ["", "1", "2", "4", "3", ""]
    ]
  },
  {
    id: 22,
    name: "Gmaj7",
    diagram: [
      ["2", "o", "o", "o", "2", "3"],
      // 3-2-0-0-0-2
      ["1", "", "", "", "2", "3"]
    ]
  },
  // ===== MINOR 7TH CHORDS =====
  {
    id: 19,
    name: "Am7",
    diagram: [
      ["o", "1", "o", "2", "o", "x"],
      // x-0-2-0-1-0
      ["", "1", "", "2", "", ""]
    ]
  },
  {
    id: 35,
    name: "Bm7",
    diagram: [
      ["2", "o", "2", "o", "2", "x"],
      // x-2-0-2-0-2
      ["3", "", "2", "", "1", ""]
    ]
  },
  {
    id: 36,
    name: "Cm7",
    diagram: [
      ["3", "4", "3", "5", "3", "x"],
      // x-3-5-3-4-3
      ["1", "2", "1", "3", "1", ""]
    ]
  },
  {
    id: 21,
    name: "Dm7",
    diagram: [
      ["1", "1", "2", "o", "x", "x"],
      // x-x-0-2-1-1
      ["1", "1", "2", "", "", ""]
    ]
  },
  {
    id: 20,
    name: "Em7",
    diagram: [
      ["o", "o", "o", "2", "o", "o"],
      // 0-2-0-0-0-0
      ["", "", "", "2", "", ""]
    ]
  },
  {
    id: 37,
    name: "Fm7",
    diagram: [
      ["1", "1", "1", "1", "3", "1"],
      // 1-3-1-1-1-1
      ["1", "1", "1", "1", "3", "1"]
    ]
  },
  {
    id: 38,
    name: "Gm7",
    diagram: [
      ["3", "3", "3", "3", "5", "3"],
      // 3-5-3-3-3-3
      ["1", "1", "1", "1", "3", "1"]
    ]
  },
  // ===== SUSPENDED CHORDS =====
  {
    id: 23,
    name: "Asus4",
    diagram: [
      ["o", "3", "2", "2", "o", "x"],
      // x-0-2-2-3-0
      ["", "4", "2", "1", "", ""]
    ]
  },
  {
    id: 52,
    name: "Asus2",
    diagram: [
      ["o", "o", "2", "2", "o", "x"],
      // x-0-2-2-0-0
      ["", "", "2", "1", "", ""]
    ]
  },
  {
    id: 39,
    name: "Csus4",
    diagram: [
      ["o", "1", "o", "3", "3", "x"],
      // x-3-3-0-1-0
      ["", "1", "", "4", "3", ""]
    ]
  },
  {
    id: 24,
    name: "Dsus4",
    diagram: [
      ["3", "3", "2", "o", "x", "x"],
      // x-x-0-2-3-3
      ["4", "3", "1", "", "", ""]
    ]
  },
  {
    id: 53,
    name: "Dsus2",
    diagram: [
      ["o", "3", "2", "o", "x", "x"],
      // x-x-0-2-3-0
      ["", "2", "1", "", "", ""]
    ]
  },
  {
    id: 25,
    name: "Esus4",
    diagram: [
      ["o", "o", "2", "2", "2", "o"],
      // 0-2-2-2-0-0
      ["", "", "3", "2", "1", ""]
    ]
  },
  {
    id: 54,
    name: "Esus2",
    diagram: [
      ["o", "o", "4", "4", "2", "o"],
      // 0-2-4-4-0-0
      ["", "", "4", "3", "1", ""]
    ]
  },
  {
    id: 40,
    name: "Fsus4",
    diagram: [
      ["1", "1", "3", "3", "3", "1"],
      // 1-3-3-3-1-1
      ["1", "1", "4", "4", "3", "1"]
    ]
  },
  {
    id: 41,
    name: "Gsus4",
    diagram: [
      ["3", "1", "o", "o", "3", "3"],
      // 3-3-0-0-1-3
      ["2", "1", "", "", "4", "3"]
    ]
  },
  {
    id: 55,
    name: "Gsus2",
    diagram: [
      ["3", "3", "o", "o", "3", "3"],
      // 3-3-0-0-3-3
      ["4", "1", "", "", "3", "2"]
    ]
  },
  {
    id: 42,
    name: "Bsus4",
    diagram: [
      ["2", "5", "4", "4", "2", "x"],
      // x-2-4-4-5-2
      ["1", "4", "3", "2", "1", ""]
    ]
  },
  // ===== ADD9 CHORDS =====
  {
    id: 43,
    name: "Aadd9",
    diagram: [
      ["o", "2", "4", "2", "o", "x"],
      // x-0-2-4-2-0
      ["", "2", "3", "1", "", ""]
    ]
  },
  {
    id: 44,
    name: "Cadd9",
    diagram: [
      ["o", "3", "o", "2", "3", "x"],
      // x-3-2-0-3-0
      ["", "4", "", "2", "3", ""]
    ]
  },
  {
    id: 45,
    name: "Dadd9",
    diagram: [
      ["o", "3", "o", "4", "5", "x"],
      // x-5-4-0-3-0
      ["", "2", "", "3", "4", ""]
    ]
  },
  {
    id: 46,
    name: "Eadd9",
    diagram: [
      ["o", "o", "1", "2", "4", "o"],
      // 0-4-2-1-0-0
      ["", "", "1", "2", "4", ""]
    ]
  },
  {
    id: 56,
    name: "Fadd9",
    diagram: [
      ["o", "1", "o", "3", "3", "x"],
      // x-3-3-0-1-0
      ["", "1", "", "4", "3", ""]
    ]
  },
  {
    id: 57,
    name: "Gadd9",
    diagram: [
      ["3", "o", "2", "o", "o", "3"],
      // 3-0-0-2-0-3
      ["3", "", "1", "", "", "2"]
    ]
  },
  // ===== POWER CHORDS (5TH) =====
  {
    id: 47,
    name: "A5",
    diagram: [
      ["x", "x", "2", "2", "o", "x"],
      // x-0-2-2-x-x
      ["", "", "2", "1", "", ""]
    ]
  },
  {
    id: 58,
    name: "B5",
    diagram: [
      ["x", "x", "4", "4", "2", "x"],
      // x-2-4-4-x-x
      ["", "", "4", "3", "1", ""]
    ]
  },
  {
    id: 51,
    name: "C5",
    diagram: [
      ["x", "x", "5", "5", "3", "x"],
      // x-3-5-5-x-x
      ["", "", "4", "3", "1", ""]
    ]
  },
  {
    id: 48,
    name: "D5",
    diagram: [
      ["x", "3", "2", "o", "x", "x"],
      // x-x-0-2-3-x
      ["", "2", "1", "", "", ""]
    ]
  },
  {
    id: 49,
    name: "E5",
    diagram: [
      ["x", "x", "x", "2", "2", "o"],
      // 0-2-2-x-x-x
      ["", "", "", "2", "1", ""]
    ]
  },
  {
    id: 59,
    name: "F5",
    diagram: [
      ["x", "x", "x", "3", "3", "1"],
      // 1-3-3-x-x-x
      ["", "", "", "4", "3", "1"]
    ]
  },
  {
    id: 50,
    name: "G5",
    diagram: [
      ["x", "x", "x", "5", "5", "3"],
      // 3-5-5-x-x-x
      ["", "", "", "4", "3", "1"]
    ]
  },
  // ===== 6TH CHORDS =====
  {
    id: 60,
    name: "A6",
    diagram: [
      ["2", "2", "2", "2", "o", "x"],
      // x-0-2-2-2-2
      ["1", "1", "1", "1", "", ""]
    ]
  },
  {
    id: 61,
    name: "C6",
    diagram: [
      ["o", "1", "2", "2", "3", "x"],
      // x-3-2-2-1-0
      ["", "1", "2", "2", "3", ""]
    ]
  },
  {
    id: 62,
    name: "D6",
    diagram: [
      ["2", "o", "2", "o", "x", "x"],
      // x-x-0-2-0-2
      ["1", "", "2", "", "", ""]
    ]
  },
  {
    id: 63,
    name: "E6",
    diagram: [
      ["o", "2", "1", "2", "2", "o"],
      // 0-2-2-1-2-0
      ["", "4", "1", "3", "2", ""]
    ]
  },
  {
    id: 64,
    name: "Am6",
    diagram: [
      ["2", "1", "2", "2", "o", "x"],
      // x-0-2-2-1-2
      ["4", "1", "3", "2", "", ""]
    ]
  },
  {
    id: 65,
    name: "Em6",
    diagram: [
      ["o", "2", "o", "2", "2", "o"],
      // 0-2-2-0-2-0
      ["", "1", "", "3", "2", ""]
    ]
  },
  // ===== DIMINISHED CHORDS =====
  {
    id: 66,
    name: "Adim",
    diagram: [
      ["x", "1", "2", "1", "o", "x"],
      // x-0-1-2-1-x
      ["", "2", "3", "1", "", ""]
    ]
  },
  {
    id: 67,
    name: "Bdim",
    diagram: [
      ["x", "3", "4", "3", "2", "x"],
      // x-2-3-4-3-x
      ["", "3", "4", "2", "1", ""]
    ]
  },
  {
    id: 68,
    name: "Ddim",
    diagram: [
      ["1", "o", "1", "o", "x", "x"],
      // x-x-0-1-0-1
      ["2", "", "1", "", "", ""]
    ]
  },
  {
    id: 69,
    name: "Edim",
    diagram: [
      ["3", "2", "3", "2", "x", "x"],
      // x-x-2-3-2-3
      ["4", "2", "3", "1", "", ""]
    ]
  },
  // ===== AUGMENTED CHORDS =====
  {
    id: 70,
    name: "Aaug",
    diagram: [
      ["1", "2", "2", "3", "o", "x"],
      // x-0-3-2-2-1
      ["1", "3", "2", "4", "", ""]
    ]
  },
  {
    id: 71,
    name: "Caug",
    diagram: [
      ["o", "1", "1", "2", "3", "x"],
      // x-3-2-1-1-0
      ["", "2", "1", "3", "4", ""]
    ]
  },
  {
    id: 72,
    name: "Eaug",
    diagram: [
      ["o", "1", "1", "2", "3", "o"],
      // 0-3-2-1-1-0
      ["", "2", "1", "3", "4", ""]
    ]
  }
];
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let selectedChords = [];
    let currentChordIndex = 0;
    let visibleChordIds = [];
    let practiceChords = selectedChords;
    practiceChords[currentChordIndex];
    chords.filter((c) => visibleChordIds.includes(c.id));
    function updateFooterHeight() {
    }
    onDestroy(() => {
      window.removeEventListener("resize", updateFooterHeight);
    });
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Guitar Practice</title>`);
      });
    });
    {
      $$renderer2.push("<!--[!-->");
      {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="app svelte-1uha8ag"><nav class="app-nav svelte-1uha8ag"><div class="app-nav__content svelte-1uha8ag"><div class="app-nav__logo svelte-1uha8ag"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="app-nav__icon svelte-1uha8ag"><path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg> <h1 class="app-nav__title svelte-1uha8ag">Guitar Practice</h1></div> <button class="settings-btn svelte-1uha8ag" aria-label="Settings"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.25 12.5a1.25 1.25 0 00.25.85l.05.05a1.515 1.515 0 010 2.15 1.515 1.515 0 01-2.15 0l-.05-.05a1.25 1.25 0 00-.85-.25 1.25 1.25 0 00-1.25 1.25v.15a1.5 1.5 0 01-3 0v-.08a1.25 1.25 0 00-.82-1.17 1.25 1.25 0 00-.85.25l-.05.05a1.515 1.515 0 01-2.15 0 1.515 1.515 0 010-2.15l.05-.05a1.25 1.25 0 00.25-.85 1.25 1.25 0 00-1.25-1.25h-.15a1.5 1.5 0 010-3h.08a1.25 1.25 0 001.17-.82 1.25 1.25 0 00-.25-.85l-.05-.05a1.515 1.515 0 010-2.15 1.515 1.515 0 012.15 0l.05.05a1.25 1.25 0 00.85.25h.06a1.25 1.25 0 001.25-1.25v-.15a1.5 1.5 0 013 0v.08a1.25 1.25 0 001.25 1.17h.06a1.25 1.25 0 00.85-.25l.05-.05a1.515 1.515 0 012.15 0 1.515 1.515 0 010 2.15l-.05.05a1.25 1.25 0 00-.25.85v.06a1.25 1.25 0 001.25 1.25h.15a1.5 1.5 0 010 3h-.08a1.25 1.25 0 00-1.17 1.25z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div></nav> <main class="app-main svelte-1uha8ag"><div class="app-main__content svelte-1uha8ag">`);
        {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div class="loading-container svelte-1uha8ag"><div class="spinner svelte-1uha8ag"></div> <p class="loading-text svelte-1uha8ag">Loading your chords...</p></div>`);
        }
        $$renderer2.push(`<!--]--></div></main> `);
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
