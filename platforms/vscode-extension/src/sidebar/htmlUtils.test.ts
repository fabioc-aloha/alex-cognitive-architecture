import { describe, it, expect } from "vitest";
import { escHtml, escAttr } from "./htmlUtils.js";

describe("escHtml", () => {
  it("escapes ampersand", () => {
    expect(escHtml("a&b")).toBe("a&amp;b");
  });

  it("escapes angle brackets", () => {
    expect(escHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes double quotes", () => {
    expect(escHtml('a"b')).toBe("a&quot;b");
  });

  it("escapes single quotes", () => {
    expect(escHtml("a'b")).toBe("a&#39;b");
  });

  it("escapes all 5 chars in one string", () => {
    expect(escHtml(`<a href="x" onclick='y'>&`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;",
    );
  });

  it("returns empty string unchanged", () => {
    expect(escHtml("")).toBe("");
  });

  it("returns safe text unchanged", () => {
    expect(escHtml("Hello World 123")).toBe("Hello World 123");
  });

  it("handles repeated special chars", () => {
    expect(escHtml("&&<<>>")).toBe("&amp;&amp;&lt;&lt;&gt;&gt;");
  });
});

describe("escAttr", () => {
  it("escapes all 7 chars (superset of escHtml)", () => {
    expect(escAttr(`<>"'&\`\\`)).toBe(
      "&lt;&gt;&quot;&#39;&amp;&#96;&#92;",
    );
  });

  it("escapes backtick (prevents template literal injection)", () => {
    expect(escAttr("a`b")).toBe("a&#96;b");
  });

  it("escapes backslash (prevents escape sequence injection)", () => {
    expect(escAttr("a\\b")).toBe("a&#92;b");
  });

  it("returns safe text unchanged", () => {
    expect(escAttr("hello-world_123")).toBe("hello-world_123");
  });

  it("handles realistic onclick injection attempt", () => {
    const malicious = `" onclick="alert(1)`;
    expect(escAttr(malicious)).toBe("&quot; onclick=&quot;alert(1)");
  });

  it("handles template literal injection attempt", () => {
    const malicious = "`${document.cookie}`";
    expect(escAttr(malicious)).toBe("&#96;${document.cookie}&#96;");
  });

  it("handles backslash escape sequence injection", () => {
    const malicious = "\\u0022onclick\\u003dalert(1)";
    expect(escAttr(malicious)).toBe(
      "&#92;u0022onclick&#92;u003dalert(1)",
    );
  });

  it("returns empty string unchanged", () => {
    expect(escAttr("")).toBe("");
  });
});
