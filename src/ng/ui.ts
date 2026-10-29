import { Component, input } from "@angular/core";
const paths: Record<string, string> = {
  leaf: "M4 20c0-5 6-10 13-12M6 16C1 5 14 9 20 3c4 15-4 20-14 13",
  home: "M3 10 12 3l9 7v11h-7v-7h-4v7H3Z",
  calendar:
    "M5 3v4m14-4v4M3 10h18M4 5h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1",
  addCalendar:
    "M5 3v4m14-4v4M3 10h18M12 21H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7m-3 3v7m-3-3.5h7",
  users:
    "M16 21v-3c0-5-13-5-13 0v3m17 0v-3c0-2-1-3-3-4M14 4c6-1 6 8 1 8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  user: "M20 21v-2c0-7-16-7-16 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  userPlus:
    "M14 21H3v-3c0-5 10-5 12-2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0m6 7v8m-4-4h8",
  lotus:
    "M12 21C3 18 4 9 12 2c8 7 9 16 0 19Zm0 0C2 22 1 16 1 9c7 1 9 6 11 12Zm0 0c10 1 11-5 11-12-7 1-9 6-11 12",
  clock: "M12 7v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  bell: "M5 9c0-9 14-9 14 0 0 7 2 8 2 8H3s2-1 2-8m5 12h4M12 1v2",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  left: "m15 5-7 7 7 7",
  plus: "M12 4v16M4 12h16",
  search: "M21 21l-6-6M17 9a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  lock: "M6 10V7a6 6 0 0 1 12 0v3M4 10h16v11H4Zm8 5v2",
  eye: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Zm14 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  phone: "M5 3H2c-2 10 10 22 20 18v-4l-5-3-3 3c-3-1-6-4-7-7l3-3Z",
  check: "m4 12 5 5L21 5",
  star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
  sparkles:
    "m9 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2Zm10 12 1 3 3 1-3 1-1 3-1-3-3-1 3-1Zm1-14v6m-3-3h6",
  edit: "m3 21 2-6L17 3l4 4L9 19Zm11-15 4 4",
  more: "M12 4v1m0 6v1m0 6v1",
  gift: "M3 8h18v5H3Zm2 5v9h14v-9M12 8v14M12 8C-2 8 5-4 12 8Zm0 0c14 0 7-12 0 0",
  cake: "M3 21V11h18v10ZM2 21h20M7 6v5m5-5v5m5-5v5M7 2v1m5-2v2m5-1v1M3 15q3 4 6 0 3 4 6 0 3 4 6 0",
  chart: "M5 21v-8m7 8V6m7 15V2",
  wallet: "M21 8H4V3h14v5M4 8H2v13h19V8Zm17 4h-7v5h7m-4-3h1",
  filter: "M3 3h18l-7 9v8l-4-2v-6Z",
  drop: "M12 2C7 9 4 12 4 16a8 8 0 0 0 16 0c0-4-3-7-8-14Z",
  sun: "M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0",
  history: "M7 3h10v3H7ZM5 5H3v17h18V5h-2M7 11h10M7 15h10M7 19h6",
  logout: "M9 3H3v18h6m5-14 5 5-5 5m-6-5h14",
  close: "m5 5 14 14M5 19 19 5",
  menu: "m3 6h18M3 12h18M3 18h18",
  money:
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M13 7c-7-2-7 5-2 5s5 7-2 5m8-10-3 10",
};
@Component({
  selector: "q-icon",
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()"/></svg>',
  styles:
    ":host{display:inline-flex;width:22px;height:22px;flex-shrink:0;vertical-align:middle}svg{width:100%;height:100%}",
})
export class Icon {
  name = input("leaf");
  path() {
    return paths[this.name()] || paths["leaf"];
  }
}
@Component({
  selector: "q-stat",
  imports: [Icon],
  template:
    '<div class="stat-icon"><q-icon [name]="icon()"/></div><div><span class="stat-label">{{label()}}</span><div class="stat-value" [class.words]="value().length>12">{{value()}}</div><small [class.orange]="orange()">{{note()}}</small></div>',
  host: { class: "stat card" },
})
export class Stat {
  icon = input("calendar");
  label = input("");
  value = input("");
  note = input("");
  orange = input(false);
}
@Component({
  selector: "q-avatar",
  template: "{{text()}}",
  host: { class: "avatar", "[class.large]": "large()" },
})
export class Avatar {
  text = input("MG");
  large = input(false);
}
@Component({
  selector: "q-badge",
  template: "{{text()}}",
  host: {
    class: "badge",
    "[class.pending]": "text() === 'Pendiente' || text() === 'Nuevo'",
    "[class.inactive]": "text() === 'Inactivo' || text() === 'Completada'",
  },
})
export class Badge {
  text = input("Confirmada");
}
@Component({
  selector: "q-art",
  template: "<img [src]=\"'assets/'+name()+'.svg'\" alt=\"\"/>",
  styles:
    ":host{display:block;width:110px;height:125px;flex-shrink:0}img{width:100%;height:100%;object-fit:contain}",
})
export class Art {
  name = input("facial");
}
