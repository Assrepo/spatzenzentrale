"use strict";

class NewsParser {
  static cleanAnswer(answer) {
    if (!answer) return "";
    let s = String(answer).replace(/\u00A0/g, " ");
    s = this.stripAfterEndMarkers(s);
    return s.trim();
  }

  static stripAfterEndMarkers(text) {
    const markers = [
      'Falls du zu einem der Beiträge weitere Details benötigst, lass es mich wissen!',
      'weitere Details benötigst'
    ];
    const lower = text.toLowerCase();
    let cutAt = -1;
    for (const m of markers) {
      const idx = lower.indexOf(m.toLowerCase());
      if (idx !== -1) cutAt = cutAt === -1 ? idx : Math.min(cutAt, idx);
    }
    if (cutAt !== -1) return text.slice(0, cutAt);
    return text;
  }

  static shouldDiscard({ fullMatch, title, content, date }) {
    const tl = (title || "").trim().toLowerCase();
    const cl = (content || "").trim().toLowerCase();
    const dl = (date || "").trim().toLowerCase();

    // 1) Offensichtliche Platzhalter aus der Instruktionszeile
    if (tl === "title" || dl === "date" || cl === "content" || cl.startsWith("content")) {
      return true;
    }

    // 2) Wenn die gesamte Fundstelle in einer "Format ..."-Zeile steht
    if (typeof fullMatch === "string" && /(^|\n|\r) *format +newsflashtitle=/i.test(fullMatch)) {
      return true;
    }

    // 3) Sehr kurze „Titel“, die fast sicher kein echter News-Titel sind
    if (title && title.trim().length < 5) return true;

    return false;
  }

  static parseFromAnswer(answer) {
    const cleaned = this.cleanAnswer(answer);

    // robust gegen beliebige Whitespaces/Zeilenumbrüche und optionales newsFlashID
    // Unterstützt auch gelegentlichen Tippfehler "newsFlahDate"
    const re =
      /newsFlashTitle=([\s\S]*?)newsFlashContent=([\s\S]*?)(?:newsFlashDate|newsFlahDate)=([\s\S]*?)(?:newsFlashID=([\s\S]*?))?(?=newsFlashTitle=|$)/gi;

    const results = [];
    let m;
    while ((m = re.exec(cleaned)) !== null) {
      const obj = {
        title: (m[1] || "").trim(),
        content: (m[2] || "").trim(),
        date: (m[3] || "").trim(),
        interviewId: (m[4] || "").trim() || null,
        __full: m[0] // für Heuristik
      };

      if (this.shouldDiscard({
        fullMatch: obj.__full,
        title: obj.title,
        content: obj.content,
        date: obj.date
      })) {
        continue;
      }

      if (obj.title && obj.content && obj.date) {
        delete obj.__full;
        results.push(obj);
      }
    }
    return results;
  }
}

module.exports = NewsParser;
