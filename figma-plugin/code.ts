// PF Design System Generator - Figma Plugin
import { ICONS_DATA } from './icons-data';

figma.showUI(__html__, { width: 320, height: 580 });

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 0, g: 0, b: 0 };
}

function sendStatus(message: string, status: "success" | "error" | "normal" = "normal") {
  figma.ui.postMessage({ type: "status", message, status });
}

function lighten(color: RGB, amount: number): RGB {
  return {
    r: color.r + (1 - color.r) * amount,
    g: color.g + (1 - color.g) * amount,
    b: color.b + (1 - color.b) * amount
  };
}

function darken(color: RGB, amount: number): RGB {
  return {
    r: color.r * (1 - amount),
    g: color.g * (1 - amount),
    b: color.b * (1 - amount)
  };
}

// Helper function to find Atoms component by name and variant properties
async function findAtomComponent(pageName: string, componentName: string, variantProps?: Record<string, string>): Promise<ComponentNode | null> {
  const page = figma.root.children.find(p => p.name === pageName) as PageNode | undefined;
  if (!page) return null;

  const componentSet = page.findOne(n => n.type === "COMPONENT_SET" && n.name === componentName) as ComponentSetNode | null;
  if (!componentSet) return null;

  if (variantProps) {
    // Find specific variant by matching all properties
    const variant = componentSet.findOne(n => {
      if (n.type !== "COMPONENT") return false;
      const component = n as ComponentNode;
      return Object.entries(variantProps).every(([key, value]) => {
        return component.name.includes(`${key}=${value}`);
      });
    }) as ComponentNode | null;
    return variant;
  }

  return componentSet.defaultVariant as ComponentNode;
}

const LIGHT_BG: Paint = { type: "SOLID", color: { r: 0.98, g: 0.98, b: 0.99 } };

async function createAnnotation(text: string, x: number, y: number, parent: SceneNode & ChildrenMixin): Promise<FrameNode> {
  const annotation = figma.createFrame();
  annotation.name = "_Annotation";
  annotation.layoutMode = "HORIZONTAL";
  annotation.primaryAxisSizingMode = "AUTO";
  annotation.counterAxisSizingMode = "AUTO";
  annotation.paddingLeft = 8;
  annotation.paddingRight = 8;
  annotation.paddingTop = 4;
  annotation.paddingBottom = 4;
  annotation.cornerRadius = 4;
  annotation.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.97 } }];
  annotation.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.85, b: 0.88 } }];
  annotation.strokeWeight = 1;
  annotation.x = x;
  annotation.y = y;

  const label = figma.createText();
  label.fontName = { family: "Pretendard", style: "Medium" };
  label.fontSize = 11;
  label.characters = text;
  label.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.45 } }];
  annotation.appendChild(label);
  parent.appendChild(annotation);
  return annotation;
}

async function createPages() {
  const pageNames = [
    "Cover",
    "---",
    "Foundations",
    "Icons",
    "---",
    "Alerts",
    "Avatars",
    "Badges",
    "Buttons",
    "Cards",
    "Checkboxes",
    "Chips",
    "Inputs",
    "Labels",
    "Links",
    "Modals",
    "Pagination",
    "Progress",
    "Radios",
    "Separators",
    "Skeletons",
    "Sliders",
    "Spinners",
    "Switches",
    "Tabs",
    "Textareas",
    "Toggles",
    "Tooltips",
    "---",
    "Templates",
    "---",
    "Playground"
  ];
  const existingNames = figma.root.children.map(p => p.name);

  for (const name of pageNames) {
    if (!existingNames.includes(name)) {
      const page = figma.createPage();
      page.name = name;
      page.backgrounds = [LIGHT_BG];
    }
  }

  for (const page of figma.root.children) {
    if (page.type === "PAGE") {
      page.backgrounds = [LIGHT_BG];
    }
  }
  sendStatus("Pages created!", "success");
}

// Generate color shades for primitives (50-900 scale)
function generatePrimitiveShades(baseColor: RGB): { shade: number; color: RGB }[] {
  return [
    { shade: 50, color: lighten(baseColor, 0.95) },
    { shade: 100, color: lighten(baseColor, 0.9) },
    { shade: 200, color: lighten(baseColor, 0.7) },
    { shade: 300, color: lighten(baseColor, 0.5) },
    { shade: 400, color: lighten(baseColor, 0.25) },
    { shade: 500, color: baseColor },
    { shade: 600, color: darken(baseColor, 0.1) },
    { shade: 700, color: darken(baseColor, 0.25) },
    { shade: 800, color: darken(baseColor, 0.4) },
    { shade: 900, color: darken(baseColor, 0.55) },
  ];
}

async function createVariables(colors: { primary: string; secondary: string }) {
  // 기존 Variable Collections 삭제
  const existingCollections = figma.variables.getLocalVariableCollections();
  for (const collection of existingCollections) {
    collection.remove();
  }

  // ═══════════════════════════════════════════════════════════
  // 1. Color Primitives - 원시 색상 (50-900 스케일)
  // ═══════════════════════════════════════════════════════════
  const primitivesCollection = figma.variables.createVariableCollection("Color Primitives");
  const primitivesModeId = primitivesCollection.modes[0].modeId;

  const primaryRgb = hexToRgb(colors.primary);
  const secondaryRgb = hexToRgb(colors.secondary);
  const successRgb: RGB = { r: 0.13, g: 0.55, b: 0.13 };
  const warningRgb: RGB = { r: 0.95, g: 0.65, b: 0.05 };
  const dangerRgb: RGB = { r: 0.86, g: 0.20, b: 0.20 };

  // Gray shades (수동 정의 - 더 정확한 회색)
  const grayShades = [
    { shade: 50, color: { r: 0.98, g: 0.98, b: 0.98 } },
    { shade: 100, color: { r: 0.96, g: 0.96, b: 0.96 } },
    { shade: 200, color: { r: 0.90, g: 0.90, b: 0.90 } },
    { shade: 300, color: { r: 0.83, g: 0.83, b: 0.83 } },
    { shade: 400, color: { r: 0.64, g: 0.64, b: 0.64 } },
    { shade: 500, color: { r: 0.45, g: 0.45, b: 0.45 } },
    { shade: 600, color: { r: 0.32, g: 0.32, b: 0.32 } },
    { shade: 700, color: { r: 0.25, g: 0.25, b: 0.25 } },
    { shade: 800, color: { r: 0.15, g: 0.15, b: 0.15 } },
    { shade: 900, color: { r: 0.07, g: 0.07, b: 0.07 } },
  ];

  // Store primitive variables for referencing
  const primitiveVars: Record<string, Variable> = {};

  // Create color primitives
  const colorGroups = [
    { name: "primary", shades: generatePrimitiveShades(primaryRgb) },
    { name: "secondary", shades: generatePrimitiveShades(secondaryRgb) },
    { name: "success", shades: generatePrimitiveShades(successRgb) },
    { name: "warning", shades: generatePrimitiveShades(warningRgb) },
    { name: "danger", shades: generatePrimitiveShades(dangerRgb) },
    { name: "gray", shades: grayShades },
  ];

  for (const group of colorGroups) {
    for (const s of group.shades) {
      const varName = `${group.name}/${s.shade}`;
      const variable = figma.variables.createVariable(varName, primitivesCollection, "COLOR");
      variable.setValueForMode(primitivesModeId, s.color);
      primitiveVars[varName] = variable;
    }
  }

  // White and Black
  const whiteVar = figma.variables.createVariable("white", primitivesCollection, "COLOR");
  whiteVar.setValueForMode(primitivesModeId, { r: 1, g: 1, b: 1 });
  primitiveVars["white"] = whiteVar;

  const blackVar = figma.variables.createVariable("black", primitivesCollection, "COLOR");
  blackVar.setValueForMode(primitivesModeId, { r: 0, g: 0, b: 0 });
  primitiveVars["black"] = blackVar;

  // ═══════════════════════════════════════════════════════════
  // 2. Color - 기능별 색상 (Primitives 참조, Light/Dark 모드)
  // ═══════════════════════════════════════════════════════════
  const colorCollection = figma.variables.createVariableCollection("Color");
  const lightModeId = colorCollection.modes[0].modeId;
  colorCollection.renameMode(lightModeId, "Light");
  const darkModeId = colorCollection.addMode("Dark");

  // Semantic color mappings: { name, lightRef, darkRef }
  // 규칙: bg는 밝게, border는 중간, text는 진하게
  const semanticMappings = [
    // Background (기본)
    { name: "bg/primary", lightRef: "white", darkRef: "gray/900" },
    { name: "bg/secondary", lightRef: "gray/50", darkRef: "gray/800" },
    // Background (브랜드/시맨틱) - 밝은 톤
    { name: "bg/brand", lightRef: "primary/50", darkRef: "primary/900" },
    { name: "bg/brand-solid", lightRef: "primary/500", darkRef: "primary/500" },
    { name: "bg/success", lightRef: "success/50", darkRef: "success/900" },
    { name: "bg/success-solid", lightRef: "success/500", darkRef: "success/500" },
    { name: "bg/warning", lightRef: "warning/50", darkRef: "warning/900" },
    { name: "bg/warning-solid", lightRef: "warning/500", darkRef: "warning/500" },
    { name: "bg/danger", lightRef: "danger/50", darkRef: "danger/900" },
    { name: "bg/danger-solid", lightRef: "danger/500", darkRef: "danger/500" },
    // Text (기본)
    { name: "text/primary", lightRef: "gray/900", darkRef: "white" },
    { name: "text/secondary", lightRef: "gray/600", darkRef: "gray/400" },
    { name: "text/disabled", lightRef: "gray/400", darkRef: "gray/600" },
    { name: "text/on-color", lightRef: "white", darkRef: "white" },
    // Text (브랜드/시맨틱) - 진한 톤
    { name: "text/brand", lightRef: "primary/700", darkRef: "primary/300" },
    { name: "text/success", lightRef: "success/700", darkRef: "success/300" },
    { name: "text/warning", lightRef: "warning/700", darkRef: "warning/300" },
    { name: "text/danger", lightRef: "danger/700", darkRef: "danger/300" },
    // Border (기본)
    { name: "border/default", lightRef: "gray/200", darkRef: "gray/700" },
    { name: "border/strong", lightRef: "gray/300", darkRef: "gray/600" },
    // Border (브랜드/시맨틱) - 중간 톤
    { name: "border/brand", lightRef: "primary/500", darkRef: "primary/500" },
    { name: "border/success", lightRef: "success/500", darkRef: "success/500" },
    { name: "border/warning", lightRef: "warning/500", darkRef: "warning/500" },
    { name: "border/danger", lightRef: "danger/500", darkRef: "danger/500" },
    // Interactive (버튼 solid 배경용)
    { name: "interactive/primary", lightRef: "primary/500", darkRef: "primary/500" },
    { name: "interactive/primary-hover", lightRef: "primary/600", darkRef: "primary/400" },
    { name: "interactive/primary-pressed", lightRef: "primary/700", darkRef: "primary/300" },
    { name: "interactive/primary-disabled", lightRef: "primary/300", darkRef: "primary/700" },
    { name: "interactive/secondary", lightRef: "gray/100", darkRef: "gray/800" },
    { name: "interactive/secondary-hover", lightRef: "gray/200", darkRef: "gray/700" },
  ];

  for (const mapping of semanticMappings) {
    const variable = figma.variables.createVariable(mapping.name, colorCollection, "COLOR");
    const lightPrimitive = primitiveVars[mapping.lightRef];
    const darkPrimitive = primitiveVars[mapping.darkRef];

    if (lightPrimitive && darkPrimitive) {
      // Alias to primitive variables
      variable.setValueForMode(lightModeId, { type: "VARIABLE_ALIAS", id: lightPrimitive.id });
      variable.setValueForMode(darkModeId, { type: "VARIABLE_ALIAS", id: darkPrimitive.id });
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3. Size - 간격, 라운드 등
  // ═══════════════════════════════════════════════════════════
  const sizeCollection = figma.variables.createVariableCollection("Size");
  const sizeModeId = sizeCollection.modes[0].modeId;

  const spacingVars = [
    { name: "space/0", value: 0 },
    { name: "space/05", value: 2 },
    { name: "space/1", value: 4 },
    { name: "space/15", value: 6 },
    { name: "space/2", value: 8 },
    { name: "space/25", value: 10 },
    { name: "space/3", value: 12 },
    { name: "space/4", value: 16 },
    { name: "space/5", value: 20 },
    { name: "space/6", value: 24 },
    { name: "space/8", value: 32 },
    { name: "space/10", value: 40 },
    { name: "space/12", value: 48 },
    { name: "space/16", value: 64 },
    { name: "space/20", value: 80 },
    { name: "space/24", value: 96 },
  ];

  const radiusVars = [
    { name: "radius/none", value: 0 },
    { name: "radius/sm", value: 4 },
    { name: "radius/md", value: 8 },
    { name: "radius/lg", value: 12 },
    { name: "radius/xl", value: 16 },
    { name: "radius/2xl", value: 24 },
    { name: "radius/full", value: 9999 },
  ];

  for (const sp of spacingVars) {
    const v = figma.variables.createVariable(sp.name, sizeCollection, "FLOAT");
    v.setValueForMode(sizeModeId, sp.value);
  }
  for (const rv of radiusVars) {
    const v = figma.variables.createVariable(rv.name, sizeCollection, "FLOAT");
    v.setValueForMode(sizeModeId, rv.value);
  }

  // ═══════════════════════════════════════════════════════════
  // 4. Typography - 폰트 크기, 줄간격 등
  // ═══════════════════════════════════════════════════════════
  const typographyCollection = figma.variables.createVariableCollection("Typography");
  const typoModeId = typographyCollection.modes[0].modeId;

  const fontSizes = [
    { name: "font-size/xs", value: 12 },
    { name: "font-size/sm", value: 14 },
    { name: "font-size/md", value: 16 },
    { name: "font-size/lg", value: 18 },
    { name: "font-size/xl", value: 20 },
    { name: "font-size/2xl", value: 24 },
    { name: "font-size/3xl", value: 30 },
    { name: "font-size/4xl", value: 36 },
    { name: "font-size/5xl", value: 48 },
    { name: "font-size/6xl", value: 60 },
  ];

  const lineHeights = [
    { name: "line-height/none", value: 1 },
    { name: "line-height/tight", value: 1.25 },
    { name: "line-height/snug", value: 1.375 },
    { name: "line-height/normal", value: 1.5 },
    { name: "line-height/relaxed", value: 1.625 },
    { name: "line-height/loose", value: 2 },
  ];

  const letterSpacings = [
    { name: "letter-spacing/tighter", value: -0.05 },
    { name: "letter-spacing/tight", value: -0.025 },
    { name: "letter-spacing/normal", value: 0 },
    { name: "letter-spacing/wide", value: 0.025 },
    { name: "letter-spacing/wider", value: 0.05 },
  ];

  for (const fs of fontSizes) {
    const v = figma.variables.createVariable(fs.name, typographyCollection, "FLOAT");
    v.setValueForMode(typoModeId, fs.value);
  }
  for (const lh of lineHeights) {
    const v = figma.variables.createVariable(lh.name, typographyCollection, "FLOAT");
    v.setValueForMode(typoModeId, lh.value);
  }
  for (const ls of letterSpacings) {
    const v = figma.variables.createVariable(ls.name, typographyCollection, "FLOAT");
    v.setValueForMode(typoModeId, ls.value);
  }

  sendStatus("Variables created! (Primitives, Color, Size, Typography)", "success");
}

async function createTypography() {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let foundationsPage = figma.root.children.find(p => p.name === "Foundations") as PageNode | undefined;
  if (!foundationsPage) { foundationsPage = figma.createPage(); foundationsPage.name = "Foundations"; }
  foundationsPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(foundationsPage);

  const section = figma.createSection();
  section.name = "Typography";
  section.x = 0; section.y = 0;
  section.resizeWithoutConstraints(2000, 1500);

  const titleSection = figma.createSection();
  titleSection.name = "Title";
  titleSection.x = 100; titleSection.y = 100;
  titleSection.resizeWithoutConstraints(800, 400);
  section.appendChild(titleSection);

  const titles = [
    { name: "Title / XL", size: 48, weight: "Bold", lineHeight: 56 },
    { name: "Title / LG", size: 40, weight: "Bold", lineHeight: 48 },
    { name: "Title / MD", size: 32, weight: "SemiBold", lineHeight: 40 },
    { name: "Title / SM", size: 24, weight: "SemiBold", lineHeight: 32 },
  ];

  let yOffset = 50;
  for (const t of titles) {
    const text = figma.createText();
    text.fontName = { family: "Pretendard", style: t.weight };
    text.fontSize = t.size;
    text.lineHeight = { value: t.lineHeight, unit: "PIXELS" };
    text.characters = t.name;
    text.x = 50; text.y = yOffset;
    titleSection.appendChild(text);
    yOffset += t.lineHeight + 20;

    const style = figma.createTextStyle();
    style.name = t.name;
    style.fontName = { family: "Pretendard", style: t.weight };
    style.fontSize = t.size;
    style.lineHeight = { value: t.lineHeight, unit: "PIXELS" };
  }

  const headingSection = figma.createSection();
  headingSection.name = "Heading";
  headingSection.x = 100; headingSection.y = 550;
  headingSection.resizeWithoutConstraints(800, 350);
  section.appendChild(headingSection);

  const headings = [
    { name: "Heading / H1", size: 28, weight: "SemiBold", lineHeight: 36 },
    { name: "Heading / H2", size: 24, weight: "SemiBold", lineHeight: 32 },
    { name: "Heading / H3", size: 20, weight: "Medium", lineHeight: 28 },
    { name: "Heading / H4", size: 18, weight: "Medium", lineHeight: 26 },
    { name: "Heading / H5", size: 16, weight: "Medium", lineHeight: 24 },
    { name: "Heading / H6", size: 14, weight: "Medium", lineHeight: 20 },
  ];

  yOffset = 50;
  for (const h of headings) {
    const text = figma.createText();
    text.fontName = { family: "Pretendard", style: h.weight };
    text.fontSize = h.size;
    text.lineHeight = { value: h.lineHeight, unit: "PIXELS" };
    text.characters = h.name;
    text.x = 50; text.y = yOffset;
    headingSection.appendChild(text);
    yOffset += h.lineHeight + 12;

    const style = figma.createTextStyle();
    style.name = h.name;
    style.fontName = { family: "Pretendard", style: h.weight };
    style.fontSize = h.size;
    style.lineHeight = { value: h.lineHeight, unit: "PIXELS" };
  }

  const bodySection = figma.createSection();
  bodySection.name = "Body";
  bodySection.x = 100; bodySection.y = 950;
  bodySection.resizeWithoutConstraints(800, 300);
  section.appendChild(bodySection);

  const bodies = [
    { name: "Body / LG", size: 18, weight: "Regular", lineHeight: 28 },
    { name: "Body / MD", size: 16, weight: "Regular", lineHeight: 24 },
    { name: "Body / SM", size: 14, weight: "Regular", lineHeight: 20 },
    { name: "Body / XS", size: 12, weight: "Regular", lineHeight: 16 },
  ];

  yOffset = 50;
  for (const b of bodies) {
    const text = figma.createText();
    text.fontName = { family: "Pretendard", style: b.weight };
    text.fontSize = b.size;
    text.lineHeight = { value: b.lineHeight, unit: "PIXELS" };
    text.characters = b.name + " - The quick brown fox jumps over the lazy dog.";
    text.x = 50; text.y = yOffset;
    bodySection.appendChild(text);
    yOffset += b.lineHeight + 16;

    const style = figma.createTextStyle();
    style.name = b.name;
    style.fontName = { family: "Pretendard", style: b.weight };
    style.fontSize = b.size;
    style.lineHeight = { value: b.lineHeight, unit: "PIXELS" };
  }

  figma.viewport.scrollAndZoomIntoView([section]);
  sendStatus("Typography created!", "success");
}

function generateColorShades(baseColor: RGB, name: string): Array<{ name: string; color: RGB }> {
  return [
    { name: name + "/50", color: lighten(baseColor, 0.9) },
    { name: name + "/100", color: lighten(baseColor, 0.7) },
    { name: name + "/200", color: lighten(baseColor, 0.5) },
    { name: name + "/300", color: lighten(baseColor, 0.3) },
    { name: name + "/400", color: lighten(baseColor, 0.1) },
    { name: name + "/500", color: baseColor },
    { name: name + "/600", color: darken(baseColor, 0.1) },
    { name: name + "/700", color: darken(baseColor, 0.3) },
    { name: name + "/800", color: darken(baseColor, 0.5) },
    { name: name + "/900", color: darken(baseColor, 0.7) },
  ];
}

function generateGrayShades(): Array<{ name: string; color: RGB }> {
  return [
    { name: "Gray/50", color: { r: 0.98, g: 0.98, b: 0.98 } },
    { name: "Gray/100", color: { r: 0.96, g: 0.96, b: 0.96 } },
    { name: "Gray/200", color: { r: 0.90, g: 0.90, b: 0.90 } },
    { name: "Gray/300", color: { r: 0.83, g: 0.83, b: 0.83 } },
    { name: "Gray/400", color: { r: 0.64, g: 0.64, b: 0.64 } },
    { name: "Gray/500", color: { r: 0.45, g: 0.45, b: 0.45 } },
    { name: "Gray/600", color: { r: 0.32, g: 0.32, b: 0.32 } },
    { name: "Gray/700", color: { r: 0.25, g: 0.25, b: 0.25 } },
    { name: "Gray/800", color: { r: 0.15, g: 0.15, b: 0.15 } },
    { name: "Gray/900", color: { r: 0.07, g: 0.07, b: 0.07 } },
  ];
}

async function createColorGroup(parent: SectionNode, groupName: string, shades: Array<{ name: string; color: RGB }>, x: number, y: number) {
  const groupFrame = figma.createFrame();
  groupFrame.name = groupName;
  groupFrame.x = x; groupFrame.y = y;
  groupFrame.layoutMode = "VERTICAL";
  groupFrame.itemSpacing = 8;
  groupFrame.paddingTop = 16; groupFrame.paddingBottom = 16;
  groupFrame.paddingLeft = 16; groupFrame.paddingRight = 16;
  groupFrame.fills = [];
  groupFrame.primaryAxisSizingMode = "AUTO";
  groupFrame.counterAxisSizingMode = "AUTO";
  parent.appendChild(groupFrame);

  const title = figma.createText();
  title.fontName = { family: "Pretendard", style: "Medium" };
  title.fontSize = 14;
  title.characters = groupName;
  title.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
  groupFrame.appendChild(title);

  for (const shade of shades) {
    const swatchFrame = figma.createFrame();
    swatchFrame.name = shade.name;
    swatchFrame.layoutMode = "HORIZONTAL";
    swatchFrame.itemSpacing = 12;
    swatchFrame.counterAxisAlignItems = "CENTER";
    swatchFrame.fills = [];
    swatchFrame.primaryAxisSizingMode = "AUTO";
    swatchFrame.counterAxisSizingMode = "AUTO";
    groupFrame.appendChild(swatchFrame);

    const rect = figma.createRectangle();
    rect.resize(48, 48);
    rect.cornerRadius = 8;
    rect.fills = [{ type: "SOLID", color: shade.color }];
    rect.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
    rect.strokeWeight = 1;
    swatchFrame.appendChild(rect);

    const label = figma.createText();
    label.fontName = { family: "Pretendard", style: "Medium" };
    label.fontSize = 12;
    label.characters = shade.name.split("/")[1] || shade.name;
    label.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    swatchFrame.appendChild(label);
    // Color Styles 제거 - Variables만 사용
  }
}

async function createColors(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });

  let foundationsPage = figma.root.children.find(p => p.name === "Foundations") as PageNode | undefined;
  if (!foundationsPage) { foundationsPage = figma.createPage(); foundationsPage.name = "Foundations"; }
  foundationsPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(foundationsPage);

  const section = figma.createSection();
  section.name = "Colors";
  section.x = 2100; section.y = 0;
  section.resizeWithoutConstraints(3200, 1400);

  const primaryRgb = hexToRgb(colors.primary);
  const secondaryRgb = hexToRgb(colors.secondary);

  // Semantic colors
  const successRgb: RGB = { r: 0.13, g: 0.55, b: 0.13 };  // #22 8B 22 Green
  const warningRgb: RGB = { r: 0.95, g: 0.65, b: 0.05 };  // #F2 A6 0D Amber
  const dangerRgb: RGB = { r: 0.86, g: 0.20, b: 0.20 };   // #DC 33 33 Red

  // Row 1: Brand colors
  await createColorGroup(section, "Primary", generateColorShades(primaryRgb, "Primary"), 100, 100);
  await createColorGroup(section, "Secondary", generateColorShades(secondaryRgb, "Secondary"), 600, 100);
  await createColorGroup(section, "Gray", generateGrayShades(), 1100, 100);

  // Row 2: Semantic colors
  await createColorGroup(section, "Success", generateColorShades(successRgb, "Success"), 100, 750);
  await createColorGroup(section, "Warning", generateColorShades(warningRgb, "Warning"), 600, 750);
  await createColorGroup(section, "Danger", generateColorShades(dangerRgb, "Danger"), 1100, 750);

  figma.viewport.scrollAndZoomIntoView([section]);
  sendStatus("Colors created!", "success");
}

async function createPropertySection(
  parent: FrameNode,
  title: string,
  description: string,
  y: number
): Promise<FrameNode> {
  const section = figma.createFrame();
  section.name = `_Property: ${title}`;
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "AUTO";
  section.itemSpacing = 16;
  section.paddingTop = 24;
  section.paddingBottom = 24;
  section.paddingLeft = 24;
  section.paddingRight = 24;
  section.y = y;
  section.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
  section.cornerRadius = 12;
  section.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
  section.strokeWeight = 1;

  // Header frame
  const header = figma.createFrame();
  header.name = "Header";
  header.layoutMode = "VERTICAL";
  header.primaryAxisSizingMode = "AUTO";
  header.counterAxisSizingMode = "AUTO";
  header.itemSpacing = 4;
  header.fills = [];

  const titleText = figma.createText();
  titleText.fontName = { family: "Pretendard", style: "SemiBold" };
  titleText.fontSize = 14;
  titleText.characters = title;
  titleText.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.15 } }];
  header.appendChild(titleText);

  const descText = figma.createText();
  descText.fontName = { family: "Pretendard", style: "Regular" };
  descText.fontSize = 12;
  descText.characters = description;
  descText.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.55 } }];
  header.appendChild(descText);

  section.appendChild(header);

  // Content frame for buttons
  const content = figma.createFrame();
  content.name = "Content";
  content.layoutMode = "HORIZONTAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "AUTO";
  content.itemSpacing = 24;
  content.fills = [];
  section.appendChild(content);

  parent.appendChild(section);
  return content;
}

async function createValueItem(
  parent: FrameNode,
  label: string,
  button: ComponentNode
): Promise<void> {
  const item = figma.createFrame();
  item.name = label;
  item.layoutMode = "VERTICAL";
  item.primaryAxisSizingMode = "AUTO";
  item.counterAxisSizingMode = "AUTO";
  item.itemSpacing = 8;
  item.counterAxisAlignItems = "CENTER";
  item.fills = [];

  const labelText = figma.createText();
  labelText.fontName = { family: "Pretendard", style: "Medium" };
  labelText.fontSize = 11;
  labelText.characters = label;
  labelText.fills = [{ type: "SOLID", color: { r: 0.45, g: 0.45, b: 0.5 } }];
  item.appendChild(labelText);

  const instance = button.createInstance();
  item.appendChild(instance);

  parent.appendChild(item);
}

// Helper to find variable by name
function findVariable(name: string): Variable | null {
  const collections = figma.variables.getLocalVariableCollections();
  for (const collection of collections) {
    for (const id of collection.variableIds) {
      const variable = figma.variables.getVariableById(id);
      if (variable && variable.name === name) return variable;
    }
  }
  return null;
}

// Helper to apply variable to fill
function applyVariableToFill(node: SceneNode & MinimalFillsMixin, variableName: string, fallbackColor: RGB): void {
  const variable = findVariable(variableName);
  if (variable) {
    const fill: SolidPaint = { type: "SOLID", color: fallbackColor };
    const boundFill = figma.variables.setBoundVariableForPaint(fill, "color", variable);
    node.fills = [boundFill];
  } else {
    node.fills = [{ type: "SOLID", color: fallbackColor }];
  }
}

// Helper to apply variable to stroke
function applyVariableToStroke(node: SceneNode & MinimalStrokesMixin, variableName: string, fallbackColor: RGB): void {
  const variable = findVariable(variableName);
  if (variable) {
    const stroke: SolidPaint = { type: "SOLID", color: fallbackColor };
    const boundStroke = figma.variables.setBoundVariableForPaint(stroke, "color", variable);
    node.strokes = [boundStroke];
  } else {
    node.strokes = [{ type: "SOLID", color: fallbackColor }];
  }
}

async function createButtons(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });

  let buttonsPage = figma.root.children.find(p => p.name === "Buttons") as PageNode | undefined;
  if (!buttonsPage) { buttonsPage = figma.createPage(); buttonsPage.name = "Buttons"; }
  buttonsPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(buttonsPage);

  for (const child of [...buttonsPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const types = ["Primary", "Secondary", "Ghost"];
  const states = ["Default", "Hover", "Pressed", "Disabled"];
  const sizes = [
    { name: "SM", height: 32, paddingX: 12, fontSize: 12 },
    { name: "MD", height: 40, paddingX: 16, fontSize: 14 },
    { name: "LG", height: 48, paddingX: 20, fontSize: 16 },
  ];

  // Variable name mappings for button styles (using semantic Color variables)
  const getVariableMapping = (type: string, state: string): {
    bgVar: string | null;
    bgFallback: RGB | null;
    textVar: string;
    textFallback: RGB;
    borderVar?: string;
    borderFallback?: RGB;
  } => {
    if (type === "Primary") {
      const textVar = "text/on-color";
      const textFallback: RGB = { r: 1, g: 1, b: 1 };
      if (state === "Default") return { bgVar: "interactive/primary", bgFallback: primaryRgb, textVar, textFallback };
      if (state === "Hover") return { bgVar: "interactive/primary-hover", bgFallback: darken(primaryRgb, 0.1), textVar, textFallback };
      if (state === "Pressed") return { bgVar: "interactive/primary-pressed", bgFallback: darken(primaryRgb, 0.2), textVar, textFallback };
      return { bgVar: "interactive/primary-disabled", bgFallback: lighten(primaryRgb, 0.5), textVar, textFallback };
    }
    if (type === "Secondary") {
      if (state === "Default") return {
        bgVar: "bg/primary", bgFallback: { r: 1, g: 1, b: 1 },
        textVar: "text/brand", textFallback: primaryRgb,
        borderVar: "border/brand", borderFallback: primaryRgb
      };
      if (state === "Hover") return {
        bgVar: "bg/brand-subtle", bgFallback: lighten(primaryRgb, 0.9),
        textVar: "text/brand", textFallback: primaryRgb,
        borderVar: "border/brand", borderFallback: primaryRgb
      };
      if (state === "Pressed") return {
        bgVar: "bg/brand-subtle", bgFallback: lighten(primaryRgb, 0.85),
        textVar: "text/brand", textFallback: primaryRgb,
        borderVar: "border/brand", borderFallback: primaryRgb
      };
      return {
        bgVar: "bg/tertiary", bgFallback: { r: 0.96, g: 0.96, b: 0.96 },
        textVar: "text/disabled", textFallback: { r: 0.64, g: 0.64, b: 0.64 },
        borderVar: "border/default", borderFallback: { r: 0.83, g: 0.83, b: 0.83 }
      };
    }
    // Ghost
    if (state === "Default") return { bgVar: null, bgFallback: null, textVar: "text/brand", textFallback: primaryRgb };
    if (state === "Hover") return { bgVar: "bg/brand-subtle", bgFallback: lighten(primaryRgb, 0.9), textVar: "text/brand", textFallback: primaryRgb };
    if (state === "Pressed") return { bgVar: "bg/brand-subtle", bgFallback: lighten(primaryRgb, 0.85), textVar: "text/brand", textFallback: primaryRgb };
    return { bgVar: null, bgFallback: null, textVar: "text/disabled", textFallback: { r: 0.64, g: 0.64, b: 0.64 } };
  };

  // First, create all button components
  const components: ComponentNode[] = [];
  const buttonMap: Record<string, ComponentNode> = {};

  for (const type of types) {
    for (const state of states) {
      for (const size of sizes) {
        const mapping = getVariableMapping(type, state);
        const button = figma.createComponent();
        button.name = `Type=${type}, State=${state}, Size=${size.name}`;
        button.layoutMode = "HORIZONTAL";
        button.primaryAxisSizingMode = "AUTO";
        button.counterAxisSizingMode = "FIXED";
        button.counterAxisAlignItems = "CENTER";
        button.primaryAxisAlignItems = "CENTER";
        button.paddingLeft = size.paddingX;
        button.paddingRight = size.paddingX;
        button.resize(100, size.height);
        button.cornerRadius = 8;

        // Apply fill with variable binding
        if (mapping.bgVar && mapping.bgFallback) {
          applyVariableToFill(button, mapping.bgVar, mapping.bgFallback);
        } else {
          button.fills = [];
        }

        // Apply stroke with variable binding
        if (mapping.borderVar && mapping.borderFallback) {
          applyVariableToStroke(button, mapping.borderVar, mapping.borderFallback);
          button.strokeWeight = 1;
        }

        // Create text with variable binding
        const text = figma.createText();
        text.fontName = { family: "Pretendard", style: "SemiBold" };
        text.fontSize = size.fontSize;
        text.characters = "Button";
        applyVariableToFill(text, mapping.textVar, mapping.textFallback);
        button.appendChild(text);

        components.push(button);
        buttonMap[`${type}-${state}-${size.name}`] = button;
      }
    }
  }

  // Create component set
  const componentSet = figma.combineAsVariants(components, buttonsPage);
  componentSet.name = "Button";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Button Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  // Title section
  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Button";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Buttons allow users to take actions with a single tap.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  // Property 1: Type
  const typeContent = await createPropertySection(
    docFrame, "Type",
    "Visual hierarchy and emphasis level of the button.", 0
  );
  for (const type of types) {
    await createValueItem(typeContent, type, buttonMap[`${type}-Default-MD`]);
  }

  // Property 2: State
  const stateContent = await createPropertySection(
    docFrame, "State",
    "Interactive states that provide feedback to user actions.", 0
  );
  for (const state of states) {
    await createValueItem(stateContent, state, buttonMap[`Primary-${state}-MD`]);
  }

  // Property 3: Size
  const sizeContent = await createPropertySection(
    docFrame, "Size",
    "Size variants for different contexts and layouts.", 0
  );
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, buttonMap[`Primary-Default-${size.name}`]);
  }

  // Add component set description
  componentSet.description = `Button Component

Buttons allow users to take actions with a single tap.

Properties:
• Type: Primary (main actions), Secondary (alternative actions), Ghost (subtle actions)
• State: Default, Hover, Pressed, Disabled
• Size: SM (32px), MD (40px), LG (48px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Buttons created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Card Component
// ═══════════════════════════════════════════════════════════
async function createCards(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });

  let cardsPage = figma.root.children.find(p => p.name === "Cards") as PageNode | undefined;
  if (!cardsPage) { cardsPage = figma.createPage(); cardsPage.name = "Cards"; }
  cardsPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(cardsPage);

  for (const child of [...cardsPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const styles = ["Default", "Outlined", "Elevated"];
  const sizes = [
    { name: "SM", padding: 16, gap: 12, width: 280 },
    { name: "MD", padding: 20, gap: 16, width: 320 },
    { name: "LG", padding: 24, gap: 20, width: 380 },
  ];

  const components: ComponentNode[] = [];
  const cardMap: Record<string, ComponentNode> = {};

  for (const style of styles) {
    for (const size of sizes) {
      const card = figma.createComponent();
      card.name = `Style=${style}, Size=${size.name}`;
      card.layoutMode = "VERTICAL";
      card.primaryAxisSizingMode = "AUTO";
      card.counterAxisSizingMode = "FIXED";
      card.resize(size.width, 100);
      card.paddingTop = size.padding;
      card.paddingBottom = size.padding;
      card.paddingLeft = size.padding;
      card.paddingRight = size.padding;
      card.itemSpacing = size.gap;
      card.cornerRadius = 12;

      // Apply styles based on variant
      if (style === "Default") {
        applyVariableToFill(card, "bg/secondary", { r: 0.98, g: 0.98, b: 0.98 });
      } else if (style === "Outlined") {
        applyVariableToFill(card, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(card, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        card.strokeWeight = 1;
      } else { // Elevated
        applyVariableToFill(card, "bg/primary", { r: 1, g: 1, b: 1 });
        card.effects = [{
          type: "DROP_SHADOW",
          color: { r: 0, g: 0, b: 0, a: 0.1 },
          offset: { x: 0, y: 4 },
          radius: 12,
          spread: 0,
          visible: true,
          blendMode: "NORMAL"
        }];
      }

      // Card Header
      const header = figma.createText();
      header.fontName = { family: "Pretendard", style: "SemiBold" };
      header.fontSize = size.name === "SM" ? 14 : size.name === "MD" ? 16 : 18;
      header.characters = "Card Title";
      applyVariableToFill(header, "text/primary", { r: 0.07, g: 0.07, b: 0.07 });
      card.appendChild(header);

      // Card Content
      const content = figma.createText();
      content.fontName = { family: "Pretendard", style: "Regular" };
      content.fontSize = size.name === "SM" ? 12 : 14;
      content.characters = "Card description text goes here. This is a sample content.";
      content.resize(size.width - (size.padding * 2), content.height);
      content.textAutoResize = "HEIGHT";
      applyVariableToFill(content, "text/secondary", { r: 0.4, g: 0.4, b: 0.4 });
      card.appendChild(content);

      components.push(card);
      cardMap[`${style}-${size.name}`] = card;
    }
  }

  // Create component set
  const componentSet = figma.combineAsVariants(components, cardsPage);
  componentSet.name = "Card";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Documentation
  const docFrame = figma.createFrame();
  docFrame.name = "Card Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Card";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Cards contain content and actions about a single subject.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const styleContent = await createPropertySection(docFrame, "Style", "Visual style of the card.", 0);
  for (const style of styles) {
    await createValueItem(styleContent, style, cardMap[`${style}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, cardMap[`Default-${size.name}`]);
  }

  componentSet.description = `Card Component

Cards contain content and actions about a single subject.

Properties:
• Style: Default (filled), Outlined (border), Elevated (shadow)
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Cards created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Badge Component
// ═══════════════════════════════════════════════════════════
async function createBadges(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });

  let badgesPage = figma.root.children.find(p => p.name === "Badges") as PageNode | undefined;
  if (!badgesPage) { badgesPage = figma.createPage(); badgesPage.name = "Badges"; }
  badgesPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(badgesPage);

  for (const child of [...badgesPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const types = [
    { name: "Primary", bgVar: "bg/brand", textVar: "text/brand", bgFallback: lighten(primaryRgb, 0.9), textFallback: primaryRgb },
    { name: "Success", bgVar: "bg/success", textVar: "text/success", bgFallback: { r: 0.9, g: 0.95, b: 0.9 }, textFallback: { r: 0.13, g: 0.55, b: 0.13 } },
    { name: "Warning", bgVar: "bg/warning", textVar: "text/warning", bgFallback: { r: 1, g: 0.95, b: 0.85 }, textFallback: { r: 0.7, g: 0.5, b: 0.05 } },
    { name: "Danger", bgVar: "bg/danger", textVar: "text/danger", bgFallback: { r: 1, g: 0.9, b: 0.9 }, textFallback: { r: 0.7, g: 0.15, b: 0.15 } },
    { name: "Gray", bgVar: "bg/secondary", textVar: "text/secondary", bgFallback: { r: 0.95, g: 0.95, b: 0.95 }, textFallback: { r: 0.4, g: 0.4, b: 0.4 } },
  ];

  const sizes = [
    { name: "SM", height: 20, paddingX: 8, fontSize: 11 },
    { name: "MD", height: 24, paddingX: 10, fontSize: 12 },
    { name: "LG", height: 28, paddingX: 12, fontSize: 13 },
  ];

  const components: ComponentNode[] = [];
  const badgeMap: Record<string, ComponentNode> = {};

  for (const type of types) {
    for (const size of sizes) {
      const badge = figma.createComponent();
      badge.name = `Type=${type.name}, Size=${size.name}`;
      badge.layoutMode = "HORIZONTAL";
      badge.primaryAxisSizingMode = "AUTO";
      badge.counterAxisSizingMode = "FIXED";
      badge.counterAxisAlignItems = "CENTER";
      badge.primaryAxisAlignItems = "CENTER";
      badge.paddingLeft = size.paddingX;
      badge.paddingRight = size.paddingX;
      badge.resize(60, size.height);
      badge.cornerRadius = size.height / 2; // Pill shape

      applyVariableToFill(badge, type.bgVar, type.bgFallback);

      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: "Medium" };
      text.fontSize = size.fontSize;
      text.characters = "Badge";
      applyVariableToFill(text, type.textVar, type.textFallback);
      badge.appendChild(text);

      components.push(badge);
      badgeMap[`${type.name}-${size.name}`] = badge;
    }
  }

  // Create component set
  const componentSet = figma.combineAsVariants(components, badgesPage);
  componentSet.name = "Badge";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Documentation
  const docFrame = figma.createFrame();
  docFrame.name = "Badge Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 600;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Badge";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Badges are used to highlight status or category.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const typeContent = await createPropertySection(docFrame, "Type", "Semantic type of the badge.", 0);
  for (const type of types) {
    await createValueItem(typeContent, type.name, badgeMap[`${type.name}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, badgeMap[`Primary-${size.name}`]);
  }

  componentSet.description = `Badge Component

Badges are used to highlight status or category.

Properties:
• Type: Primary, Success, Warning, Danger, Gray
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Badges created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Input Component
// ═══════════════════════════════════════════════════════════
async function createInputs(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let inputsPage = figma.root.children.find(p => p.name === "Inputs") as PageNode | undefined;
  if (!inputsPage) { inputsPage = figma.createPage(); inputsPage.name = "Inputs"; }
  inputsPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(inputsPage);

  for (const child of [...inputsPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Default", "Focus", "Error", "Disabled"];
  const sizes = [
    { name: "SM", height: 32, paddingX: 12, fontSize: 12 },
    { name: "MD", height: 40, paddingX: 16, fontSize: 14 },
    { name: "LG", height: 48, paddingX: 20, fontSize: 16 },
  ];

  const components: ComponentNode[] = [];
  const inputMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const input = figma.createComponent();
      input.name = `State=${state}, Size=${size.name}`;
      input.layoutMode = "HORIZONTAL";
      input.primaryAxisSizingMode = "FIXED";
      input.counterAxisSizingMode = "FIXED";
      input.counterAxisAlignItems = "CENTER";
      input.paddingLeft = size.paddingX;
      input.paddingRight = size.paddingX;
      input.resize(280, size.height);
      input.cornerRadius = 7;

      // Background and border based on state
      if (state === "Default") {
        applyVariableToFill(input, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(input, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        input.strokeWeight = 1;
      } else if (state === "Focus") {
        applyVariableToFill(input, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(input, "border/brand", primaryRgb);
        input.strokeWeight = 2;
      } else if (state === "Error") {
        applyVariableToFill(input, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(input, "border/danger", { r: 0.86, g: 0.20, b: 0.20 });
        input.strokeWeight = 2;
      } else { // Disabled
        applyVariableToFill(input, "bg/secondary", { r: 0.98, g: 0.98, b: 0.98 });
        applyVariableToStroke(input, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        input.strokeWeight = 1;
      }

      // Placeholder text
      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: "Regular" };
      text.fontSize = size.fontSize;
      text.characters = state === "Disabled" ? "Disabled" : "Placeholder";
      applyVariableToFill(text, state === "Disabled" ? "text/disabled" : "text/secondary", { r: 0.64, g: 0.64, b: 0.64 });
      input.appendChild(text);

      components.push(input);
      inputMap[`${state}-${size.name}`] = input;
    }
  }

  const componentSet = figma.combineAsVariants(components, inputsPage);
  componentSet.name = "Input";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Input Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  // Title section
  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Input";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Text input fields for user data entry.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  // Property 1: State
  const stateContent = await createPropertySection(
    docFrame, "State",
    "Visual feedback for different interaction states.", 0
  );
  for (const state of states) {
    await createValueItem(stateContent, state, inputMap[`${state}-MD`]);
  }

  // Property 2: Size
  const sizeContent = await createPropertySection(
    docFrame, "Size",
    "Size variants for different contexts and layouts.", 0
  );
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, inputMap[`Default-${size.name}`]);
  }

  componentSet.description = `Input Component

Text input fields for user data entry.

Properties:
• State: Default, Focus, Error, Disabled
• Size: SM (32px), MD (40px), LG (48px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Inputs created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Checkbox Component
// ═══════════════════════════════════════════════════════════
async function createCheckboxes(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let checkboxPage = figma.root.children.find(p => p.name === "Checkboxes") as PageNode | undefined;
  if (!checkboxPage) { checkboxPage = figma.createPage(); checkboxPage.name = "Checkboxes"; }
  checkboxPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(checkboxPage);

  for (const child of [...checkboxPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Unchecked", "Checked", "Disabled"];
  const sizes = [
    { name: "SM", size: 16 },
    { name: "MD", size: 20 },
    { name: "LG", size: 24 },
  ];

  const components: ComponentNode[] = [];
  const checkboxMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const checkbox = figma.createComponent();
      checkbox.name = `State=${state}, Size=${size.name}`;
      checkbox.resize(size.size, size.size);
      checkbox.cornerRadius = 2;

      if (state === "Checked") {
        applyVariableToFill(checkbox, "interactive/primary", primaryRgb);

        // Create checkmark using vector with 70% size
        const check = figma.createVector();
        const s = size.size;
        const checkSize = s * 0.7;

        // Define checkmark path relative to 70% size
        check.vectorPaths = [{
          windingRule: "NONZERO",
          data: `M ${checkSize * 0.2} ${checkSize * 0.5} L ${checkSize * 0.45} ${checkSize * 0.8} L ${checkSize * 0.8} ${checkSize * 0.2}`
        }];

        check.strokes = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        check.strokeWeight = size.size <= 16 ? 1.5 : 2;
        check.strokeCap = "ROUND";
        check.strokeJoin = "ROUND";
        check.resize(checkSize, checkSize);
        // Center the checkmark in the box
        check.x = (s - checkSize) / 2;
        check.y = (s - checkSize) / 2;
        checkbox.appendChild(check);
      } else if (state === "Disabled") {
        applyVariableToFill(checkbox, "bg/secondary", { r: 0.96, g: 0.96, b: 0.96 });
        applyVariableToStroke(checkbox, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        checkbox.strokeWeight = 1;
      } else { // Unchecked
        applyVariableToFill(checkbox, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(checkbox, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        checkbox.strokeWeight = 1;
      }

      components.push(checkbox);
      checkboxMap[`${state}-${size.name}`] = checkbox;
    }
  }

  const componentSet = figma.combineAsVariants(components, checkboxPage);
  componentSet.name = "Checkbox";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Checkbox Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 600;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Checkbox";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Checkboxes allow users to select one or more items from a set.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Selection states for the checkbox.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, checkboxMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, checkboxMap[`Unchecked-${size.name}`]);
  }

  componentSet.description = `Checkbox Component

Checkboxes allow users to select one or more items from a set.

Properties:
• State: Unchecked, Checked, Disabled
• Size: SM (16px), MD (20px), LG (24px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Checkboxes created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Radio Component
// ═══════════════════════════════════════════════════════════
async function createRadios(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let radioPage = figma.root.children.find(p => p.name === "Radios") as PageNode | undefined;
  if (!radioPage) { radioPage = figma.createPage(); radioPage.name = "Radios"; }
  radioPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(radioPage);

  for (const child of [...radioPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Unselected", "Selected", "Disabled"];
  const sizes = [
    { name: "SM", size: 16, dotSize: 8 },
    { name: "MD", size: 20, dotSize: 10 },
    { name: "LG", size: 24, dotSize: 12 },
  ];

  const components: ComponentNode[] = [];
  const radioMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const radio = figma.createComponent();
      radio.name = `State=${state}, Size=${size.name}`;
      radio.resize(size.size, size.size);
      radio.cornerRadius = size.size / 2; // Circle

      if (state === "Selected") {
        applyVariableToFill(radio, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(radio, "interactive/primary", primaryRgb);
        radio.strokeWeight = 2;

        // Inner dot
        const dot = figma.createEllipse();
        dot.resize(size.dotSize, size.dotSize);
        dot.x = (size.size - size.dotSize) / 2;
        dot.y = (size.size - size.dotSize) / 2;
        applyVariableToFill(dot, "interactive/primary", primaryRgb);
        radio.appendChild(dot);
      } else if (state === "Disabled") {
        applyVariableToFill(radio, "bg/secondary", { r: 0.96, g: 0.96, b: 0.96 });
        applyVariableToStroke(radio, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        radio.strokeWeight = 1;
      } else { // Unselected
        applyVariableToFill(radio, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(radio, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        radio.strokeWeight = 1;
      }

      components.push(radio);
      radioMap[`${state}-${size.name}`] = radio;
    }
  }

  const componentSet = figma.combineAsVariants(components, radioPage);
  componentSet.name = "Radio";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Radio Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 600;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Radio";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Radio buttons allow users to select one option from a set.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Selection states for the radio button.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, radioMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, radioMap[`Unselected-${size.name}`]);
  }

  componentSet.description = `Radio Component

Radio buttons allow users to select one option from a set.

Properties:
• State: Unselected, Selected, Disabled
• Size: SM (16px), MD (20px), LG (24px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Radios created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Switch Component
// ═══════════════════════════════════════════════════════════
async function createSwitches(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let switchPage = figma.root.children.find(p => p.name === "Switches") as PageNode | undefined;
  if (!switchPage) { switchPage = figma.createPage(); switchPage.name = "Switches"; }
  switchPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(switchPage);

  for (const child of [...switchPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Off", "On", "Disabled"];
  const sizes = [
    { name: "SM", width: 36, height: 20, knobSize: 16, knobPadding: 2 },
    { name: "MD", width: 44, height: 24, knobSize: 20, knobPadding: 2 },
    { name: "LG", width: 52, height: 28, knobSize: 24, knobPadding: 2 },
  ];

  const components: ComponentNode[] = [];
  const switchMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const switchComp = figma.createComponent();
      switchComp.name = `State=${state}, Size=${size.name}`;
      switchComp.resize(size.width, size.height);
      switchComp.cornerRadius = size.height / 2;

      if (state === "On") {
        applyVariableToFill(switchComp, "interactive/primary", primaryRgb);
      } else if (state === "Disabled") {
        applyVariableToFill(switchComp, "bg/secondary", { r: 0.9, g: 0.9, b: 0.9 });
      } else { // Off
        applyVariableToFill(switchComp, "interactive/secondary", { r: 0.83, g: 0.83, b: 0.83 });
      }

      // Knob
      const knob = figma.createEllipse();
      knob.resize(size.knobSize, size.knobSize);
      knob.x = state === "On" ? size.width - size.knobSize - size.knobPadding : size.knobPadding;
      knob.y = size.knobPadding;
      knob.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      switchComp.appendChild(knob);

      components.push(switchComp);
      switchMap[`${state}-${size.name}`] = switchComp;
    }
  }

  const componentSet = figma.combineAsVariants(components, switchPage);
  componentSet.name = "Switch";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Switch Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Switch";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Switches allow users to toggle between two states.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Switch states for on/off interactions.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, switchMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, switchMap[`Off-${size.name}`]);
  }

  componentSet.description = `Switch Component

Switches allow users to toggle between two states.

Properties:
• State: Off, On, Disabled
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Switches created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Avatar Component
// ═══════════════════════════════════════════════════════════
async function createAvatars(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let avatarPage = figma.root.children.find(p => p.name === "Avatars") as PageNode | undefined;
  if (!avatarPage) { avatarPage = figma.createPage(); avatarPage.name = "Avatars"; }
  avatarPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(avatarPage);

  for (const child of [...avatarPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const sizes = [
    { name: "XS", size: 24, fontSize: 10 },
    { name: "SM", size: 32, fontSize: 12 },
    { name: "MD", size: 40, fontSize: 14 },
    { name: "LG", size: 48, fontSize: 16 },
    { name: "XL", size: 64, fontSize: 20 },
  ];

  const components: ComponentNode[] = [];
  const avatarMap: Record<string, ComponentNode> = {};

  for (const size of sizes) {
    const avatar = figma.createComponent();
    avatar.name = `Size=${size.name}`;
    avatar.resize(size.size, size.size);
    avatar.cornerRadius = size.size / 2; // Circle
    applyVariableToFill(avatar, "bg/brand", lighten(primaryRgb, 0.85));

    // Initials
    const text = figma.createText();
    text.fontName = { family: "Pretendard", style: "SemiBold" };
    text.fontSize = size.fontSize;
    text.characters = "AB";
    text.textAlignHorizontal = "CENTER";
    text.textAlignVertical = "CENTER";
    text.resize(size.size, size.size);
    applyVariableToFill(text, "text/brand", primaryRgb);
    avatar.appendChild(text);

    components.push(avatar);
    avatarMap[size.name] = avatar;
  }

  const componentSet = figma.combineAsVariants(components, avatarPage);
  componentSet.name = "Avatar";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Avatar Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 600;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Avatar";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Avatars represent users or entities.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, avatarMap[size.name]);
  }

  componentSet.description = `Avatar Component

Avatars represent users or entities.

Properties:
• Size: XS (24px), SM (32px), MD (40px), LG (48px), XL (64px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Avatars created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Label Component
// ═══════════════════════════════════════════════════════════
async function createLabels(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let labelPage = figma.root.children.find(p => p.name === "Labels") as PageNode | undefined;
  if (!labelPage) { labelPage = figma.createPage(); labelPage.name = "Labels"; }
  labelPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(labelPage);

  for (const child of [...labelPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const states = ["Default", "Required", "Disabled"];
  const sizes = [
    { name: "SM", fontSize: 12, lineHeight: 16 },
    { name: "MD", fontSize: 14, lineHeight: 20 },
    { name: "LG", fontSize: 16, lineHeight: 24 },
  ];

  const components: ComponentNode[] = [];
  const labelMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const label = figma.createComponent();
      label.name = `State=${state}, Size=${size.name}`;
      label.layoutMode = "HORIZONTAL";
      label.primaryAxisSizingMode = "AUTO";
      label.counterAxisSizingMode = "AUTO";
      label.itemSpacing = 4;
      label.fills = [];

      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: state === "Required" ? "Medium" : "Regular" };
      text.fontSize = size.fontSize;
      text.characters = "Label";

      if (state === "Disabled") {
        applyVariableToFill(text, "text/disabled", { r: 0.64, g: 0.64, b: 0.64 });
      } else {
        applyVariableToFill(text, "text/primary", { r: 0.1, g: 0.1, b: 0.12 });
      }

      label.appendChild(text);

      // Add asterisk for required
      if (state === "Required") {
        const asterisk = figma.createText();
        asterisk.fontName = { family: "Pretendard", style: "Medium" };
        asterisk.fontSize = size.fontSize;
        asterisk.characters = "*";
        applyVariableToFill(asterisk, "text/danger", { r: 0.86, g: 0.20, b: 0.20 });
        label.appendChild(asterisk);
      }

      components.push(label);
      labelMap[`${state}-${size.name}`] = label;
    }
  }

  const componentSet = figma.combineAsVariants(components, labelPage);
  componentSet.name = "Label";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Label Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Label";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Text labels for form fields and UI elements.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Label states for different contexts.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, labelMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, labelMap[`Default-${size.name}`]);
  }

  componentSet.description = `Label Component

Text labels for form fields and UI elements.

Properties:
• State: Default, Required, Disabled
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Labels created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Link Component
// ═══════════════════════════════════════════════════════════
async function createLinks(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let linkPage = figma.root.children.find(p => p.name === "Links") as PageNode | undefined;
  if (!linkPage) { linkPage = figma.createPage(); linkPage.name = "Links"; }
  linkPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(linkPage);

  for (const child of [...linkPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Default", "Hover", "Visited", "Disabled"];
  const sizes = [
    { name: "SM", fontSize: 12, lineHeight: 16 },
    { name: "MD", fontSize: 14, lineHeight: 20 },
    { name: "LG", fontSize: 16, lineHeight: 24 },
  ];

  const components: ComponentNode[] = [];
  const linkMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const link = figma.createComponent();
      link.name = `State=${state}, Size=${size.name}`;
      link.layoutMode = "HORIZONTAL";
      link.primaryAxisSizingMode = "AUTO";
      link.counterAxisSizingMode = "AUTO";
      link.fills = [];

      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: "Medium" };
      text.fontSize = size.fontSize;
      text.characters = "Link";
      text.textDecoration = state === "Default" || state === "Hover" ? "UNDERLINE" : "NONE";

      if (state === "Disabled") {
        applyVariableToFill(text, "text/disabled", { r: 0.64, g: 0.64, b: 0.64 });
      } else if (state === "Visited") {
        applyVariableToFill(text, "interactive/secondary-hover", { r: 0.45, g: 0.42, b: 0.73 });
      } else {
        applyVariableToFill(text, "text/brand", primaryRgb);
      }

      link.appendChild(text);

      components.push(link);
      linkMap[`${state}-${size.name}`] = link;
    }
  }

  const componentSet = figma.combineAsVariants(components, linkPage);
  componentSet.name = "Link";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Link Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Link";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Hyperlinks for navigation and actions.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Link states for different interactions.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, linkMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, linkMap[`Default-${size.name}`]);
  }

  componentSet.description = `Link Component

Hyperlinks for navigation and actions.

Properties:
• State: Default, Hover, Visited, Disabled
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Links created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Textarea Component
// ═══════════════════════════════════════════════════════════
async function createTextareas(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let textareaPage = figma.root.children.find(p => p.name === "Textareas") as PageNode | undefined;
  if (!textareaPage) { textareaPage = figma.createPage(); textareaPage.name = "Textareas"; }
  textareaPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(textareaPage);

  for (const child of [...textareaPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Default", "Focus", "Error", "Disabled"];
  const sizes = [
    { name: "SM", height: 80, paddingX: 12, paddingY: 8, fontSize: 12 },
    { name: "MD", height: 100, paddingX: 14, paddingY: 10, fontSize: 14 },
    { name: "LG", height: 120, paddingX: 16, paddingY: 12, fontSize: 16 },
  ];

  const components: ComponentNode[] = [];
  const textareaMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const textarea = figma.createComponent();
      textarea.name = `State=${state}, Size=${size.name}`;
      textarea.layoutMode = "VERTICAL";
      textarea.primaryAxisSizingMode = "FIXED";
      textarea.counterAxisSizingMode = "FIXED";
      textarea.primaryAxisAlignItems = "MIN";
      textarea.paddingLeft = size.paddingX;
      textarea.paddingRight = size.paddingX;
      textarea.paddingTop = size.paddingY;
      textarea.paddingBottom = size.paddingY;
      textarea.resize(280, size.height);
      textarea.cornerRadius = 8;

      // Background and border based on state
      if (state === "Default") {
        applyVariableToFill(textarea, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(textarea, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        textarea.strokeWeight = 1;
      } else if (state === "Focus") {
        applyVariableToFill(textarea, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(textarea, "border/brand", primaryRgb);
        textarea.strokeWeight = 2;
      } else if (state === "Error") {
        applyVariableToFill(textarea, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(textarea, "border/danger", { r: 0.86, g: 0.20, b: 0.20 });
        textarea.strokeWeight = 2;
      } else { // Disabled
        applyVariableToFill(textarea, "bg/secondary", { r: 0.98, g: 0.98, b: 0.98 });
        applyVariableToStroke(textarea, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        textarea.strokeWeight = 1;
      }

      // Placeholder text
      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: "Regular" };
      text.fontSize = size.fontSize;
      text.characters = state === "Disabled" ? "Disabled" : "Enter text...";
      applyVariableToFill(text, state === "Disabled" ? "text/disabled" : "text/secondary", { r: 0.64, g: 0.64, b: 0.64 });
      textarea.appendChild(text);

      components.push(textarea);
      textareaMap[`${state}-${size.name}`] = textarea;
    }
  }

  const componentSet = figma.combineAsVariants(components, textareaPage);
  componentSet.name = "Textarea";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Textarea Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Textarea";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Multi-line text input fields for longer content.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Visual feedback for different interaction states.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, textareaMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, textareaMap[`Default-${size.name}`]);
  }

  componentSet.description = `Textarea Component

Multi-line text input fields for longer content.

Properties:
• State: Default, Focus, Error, Disabled
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Textareas created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Progress Bar Component
// ═══════════════════════════════════════════════════════════
async function createProgressBars(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let progressPage = figma.root.children.find(p => p.name === "Progress") as PageNode | undefined;
  if (!progressPage) { progressPage = figma.createPage(); progressPage.name = "Progress"; }
  progressPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(progressPage);

  for (const child of [...progressPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const values = [0, 25, 50, 75, 100];
  const sizes = [
    { name: "SM", height: 4, width: 200 },
    { name: "MD", height: 8, width: 200 },
    { name: "LG", height: 12, width: 200 },
  ];

  const components: ComponentNode[] = [];
  const progressMap: Record<string, ComponentNode> = {};

  for (const value of values) {
    for (const size of sizes) {
      const progress = figma.createComponent();
      progress.name = `Value=${value}, Size=${size.name}`;
      progress.layoutMode = "HORIZONTAL";
      progress.primaryAxisSizingMode = "FIXED";
      progress.counterAxisSizingMode = "FIXED";
      progress.resize(size.width, size.height);
      progress.cornerRadius = size.height / 2;
      applyVariableToFill(progress, "bg/secondary", { r: 0.95, g: 0.95, b: 0.95 });

      // Progress fill
      if (value > 0) {
        const fill = figma.createRectangle();
        fill.resize((size.width * value) / 100, size.height);
        fill.cornerRadius = size.height / 2;
        applyVariableToFill(fill, "interactive/primary", primaryRgb);
        progress.appendChild(fill);
      }

      components.push(progress);
      progressMap[`${value}-${size.name}`] = progress;
    }
  }

  const componentSet = figma.combineAsVariants(components, progressPage);
  componentSet.name = "Progress";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  const docFrame = figma.createFrame();
  docFrame.name = "Progress Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Progress";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Progress indicators show completion status.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const valueContent = await createPropertySection(docFrame, "Value", "Progress completion percentage.", 0);
  for (const value of [0, 50, 100]) {
    await createValueItem(valueContent, `${value}%`, progressMap[`${value}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, progressMap[`50-${size.name}`]);
  }

  componentSet.description = `Progress Component

Progress indicators show completion status.

Properties:
• Value: 0%, 25%, 50%, 75%, 100%
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Progress bars created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Skeleton Component
// ═══════════════════════════════════════════════════════════
async function createSkeletons(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let skeletonPage = figma.root.children.find(p => p.name === "Skeletons") as PageNode | undefined;
  if (!skeletonPage) { skeletonPage = figma.createPage(); skeletonPage.name = "Skeletons"; }
  skeletonPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(skeletonPage);

  for (const child of [...skeletonPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const types = ["Text", "Circle", "Rectangle"];
  const sizes = [
    { name: "SM", textHeight: 12, circleSize: 32, rectWidth: 120, rectHeight: 12 },
    { name: "MD", textHeight: 16, circleSize: 48, rectWidth: 200, rectHeight: 16 },
    { name: "LG", textHeight: 20, circleSize: 64, rectWidth: 280, rectHeight: 20 },
  ];

  const components: ComponentNode[] = [];
  const skeletonMap: Record<string, ComponentNode> = {};

  for (const type of types) {
    for (const size of sizes) {
      const skeleton = figma.createComponent();
      skeleton.name = `Type=${type}, Size=${size.name}`;

      if (type === "Text") {
        skeleton.resize(200, size.textHeight);
        skeleton.cornerRadius = 4;
      } else if (type === "Circle") {
        skeleton.resize(size.circleSize, size.circleSize);
        skeleton.cornerRadius = size.circleSize / 2;
      } else { // Rectangle
        skeleton.resize(size.rectWidth, size.rectHeight);
        skeleton.cornerRadius = 8;
      }

      applyVariableToFill(skeleton, "bg/secondary", { r: 0.93, g: 0.93, b: 0.93 });

      components.push(skeleton);
      skeletonMap[`${type}-${size.name}`] = skeleton;
    }
  }

  const componentSet = figma.combineAsVariants(components, skeletonPage);
  componentSet.name = "Skeleton";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  const docFrame = figma.createFrame();
  docFrame.name = "Skeleton Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Skeleton";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Skeleton loaders indicate content is loading.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const typeContent = await createPropertySection(docFrame, "Type", "Skeleton shape variants.", 0);
  for (const type of types) {
    await createValueItem(typeContent, type, skeletonMap[`${type}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, skeletonMap[`Rectangle-${size.name}`]);
  }

  componentSet.description = `Skeleton Component

Skeleton loaders indicate content is loading.

Properties:
• Type: Text, Circle, Rectangle
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Skeletons created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Slider Component
// ═══════════════════════════════════════════════════════════
async function createSliders(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let sliderPage = figma.root.children.find(p => p.name === "Sliders") as PageNode | undefined;
  if (!sliderPage) { sliderPage = figma.createPage(); sliderPage.name = "Sliders"; }
  sliderPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(sliderPage);

  for (const child of [...sliderPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const values = [0, 50, 100];
  const sizes = [
    { name: "SM", trackHeight: 4, thumbSize: 16, width: 200 },
    { name: "MD", trackHeight: 6, thumbSize: 20, width: 200 },
    { name: "LG", trackHeight: 8, thumbSize: 24, width: 200 },
  ];

  const components: ComponentNode[] = [];
  const sliderMap: Record<string, ComponentNode> = {};

  for (const value of values) {
    for (const size of sizes) {
      const slider = figma.createComponent();
      slider.name = `Value=${value}, Size=${size.name}`;
      slider.resize(size.width, size.thumbSize);

      // Track background
      const trackBg = figma.createRectangle();
      trackBg.resize(size.width, size.trackHeight);
      trackBg.x = 0;
      trackBg.y = (size.thumbSize - size.trackHeight) / 2;
      trackBg.cornerRadius = size.trackHeight / 2;
      applyVariableToFill(trackBg, "bg/secondary", { r: 0.93, g: 0.93, b: 0.93 });
      slider.appendChild(trackBg);

      // Active track
      if (value > 0) {
        const trackActive = figma.createRectangle();
        const activeWidth = (size.width * value) / 100;
        trackActive.resize(activeWidth, size.trackHeight);
        trackActive.x = 0;
        trackActive.y = (size.thumbSize - size.trackHeight) / 2;
        trackActive.cornerRadius = size.trackHeight / 2;
        applyVariableToFill(trackActive, "interactive/primary", primaryRgb);
        slider.appendChild(trackActive);
      }

      // Thumb
      const thumb = figma.createEllipse();
      thumb.resize(size.thumbSize, size.thumbSize);
      const thumbX = Math.max(0, Math.min(size.width - size.thumbSize, (size.width * value) / 100 - size.thumbSize / 2));
      thumb.x = thumbX;
      thumb.y = 0;
      thumb.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      thumb.strokeWeight = 2;
      applyVariableToStroke(thumb, "interactive/primary", primaryRgb);
      slider.appendChild(thumb);

      components.push(slider);
      sliderMap[`${value}-${size.name}`] = slider;
    }
  }

  const componentSet = figma.combineAsVariants(components, sliderPage);
  componentSet.name = "Slider";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  const docFrame = figma.createFrame();
  docFrame.name = "Slider Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Slider";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Sliders allow users to select a value from a range.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const valueContent = await createPropertySection(docFrame, "Value", "Slider position.", 0);
  for (const value of values) {
    await createValueItem(valueContent, `${value}%`, sliderMap[`${value}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, sliderMap[`50-${size.name}`]);
  }

  componentSet.description = `Slider Component

Sliders allow users to select a value from a range.

Properties:
• Value: 0%, 50%, 100%
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Sliders created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Toggle (Segmented Control) Component
// ═══════════════════════════════════════════════════════════
async function createToggles(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let togglePage = figma.root.children.find(p => p.name === "Toggles") as PageNode | undefined;
  if (!togglePage) { togglePage = figma.createPage(); togglePage.name = "Toggles"; }
  togglePage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(togglePage);

  for (const child of [...togglePage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const options = [2, 3];
  const sizes = [
    { name: "SM", height: 32, fontSize: 12, padding: 4 },
    { name: "MD", height: 40, fontSize: 14, padding: 4 },
    { name: "LG", height: 48, fontSize: 16, padding: 4 },
  ];

  const components: ComponentNode[] = [];
  const toggleMap: Record<string, ComponentNode> = {};

  for (const optionCount of options) {
    for (const size of sizes) {
      const toggle = figma.createComponent();
      toggle.name = `Options=${optionCount}, Size=${size.name}`;
      toggle.layoutMode = "HORIZONTAL";
      toggle.primaryAxisSizingMode = "AUTO";
      toggle.counterAxisSizingMode = "FIXED";
      toggle.resize(200, size.height);
      toggle.itemSpacing = 0;
      toggle.paddingLeft = size.padding;
      toggle.paddingRight = size.padding;
      toggle.paddingTop = size.padding;
      toggle.paddingBottom = size.padding;
      toggle.cornerRadius = 8;
      applyVariableToFill(toggle, "bg/secondary", { r: 0.95, g: 0.95, b: 0.95 });

      for (let i = 0; i < optionCount; i++) {
        const option = figma.createFrame();
        option.layoutMode = "HORIZONTAL";
        option.primaryAxisSizingMode = "FIXED";
        option.counterAxisSizingMode = "FIXED";
        option.primaryAxisAlignItems = "CENTER";
        option.counterAxisAlignItems = "CENTER";
        option.resize(80, size.height - size.padding * 2);
        option.cornerRadius = 6;
        option.paddingLeft = 12;
        option.paddingRight = 12;

        if (i === 0) {
          applyVariableToFill(option, "bg/primary", { r: 1, g: 1, b: 1 });
          option.effects = [{ type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: 0.1 }, offset: { x: 0, y: 1 }, radius: 2, visible: true, blendMode: "NORMAL" }];
        } else {
          option.fills = [];
        }

        const text = figma.createText();
        text.fontName = { family: "Pretendard", style: i === 0 ? "Medium" : "Regular" };
        text.fontSize = size.fontSize;
        text.characters = i === 0 ? "Option 1" : `Option ${i + 1}`;
        applyVariableToFill(text, i === 0 ? "text/primary" : "text/secondary", i === 0 ? { r: 0.1, g: 0.1, b: 0.12 } : { r: 0.5, g: 0.5, b: 0.5 });
        option.appendChild(text);

        toggle.appendChild(option);
      }

      components.push(toggle);
      toggleMap[`${optionCount}-${size.name}`] = toggle;
    }
  }

  const componentSet = figma.combineAsVariants(components, togglePage);
  componentSet.name = "Toggle";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  const docFrame = figma.createFrame();
  docFrame.name = "Toggle Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 700;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Toggle (Segmented Control)";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Segmented controls allow users to switch between multiple options.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const optionsContent = await createPropertySection(docFrame, "Options", "Number of toggle options.", 0);
  for (const optionCount of options) {
    await createValueItem(optionsContent, `${optionCount} Options`, toggleMap[`${optionCount}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, toggleMap[`2-${size.name}`]);
  }

  componentSet.description = `Toggle (Segmented Control) Component

Segmented controls allow users to switch between multiple options.

Properties:
• Options: 2, 3
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Toggles created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Chip Component
// ═══════════════════════════════════════════════════════════
async function createChips(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let chipPage = figma.root.children.find(p => p.name === "Chips") as PageNode | undefined;
  if (!chipPage) { chipPage = figma.createPage(); chipPage.name = "Chips"; }
  chipPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(chipPage);

  for (const child of [...chipPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const states = ["Default", "Selected"];
  const sizes = [
    { name: "SM", height: 24, paddingX: 10, fontSize: 11 },
    { name: "MD", height: 28, paddingX: 12, fontSize: 12 },
    { name: "LG", height: 32, paddingX: 14, fontSize: 13 },
  ];

  const components: ComponentNode[] = [];
  const chipMap: Record<string, ComponentNode> = {};

  for (const state of states) {
    for (const size of sizes) {
      const chip = figma.createComponent();
      chip.name = `State=${state}, Size=${size.name}`;
      chip.layoutMode = "HORIZONTAL";
      chip.primaryAxisSizingMode = "AUTO";
      chip.counterAxisSizingMode = "FIXED";
      chip.counterAxisAlignItems = "CENTER";
      chip.primaryAxisAlignItems = "CENTER";
      chip.paddingLeft = size.paddingX;
      chip.paddingRight = size.paddingX;
      chip.resize(80, size.height);
      chip.cornerRadius = size.height / 2;

      if (state === "Selected") {
        applyVariableToFill(chip, "bg/brand-solid", primaryRgb);
      } else {
        applyVariableToFill(chip, "bg/secondary", { r: 0.95, g: 0.95, b: 0.95 });
      }

      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: "Medium" };
      text.fontSize = size.fontSize;
      text.characters = "Chip";
      applyVariableToFill(text, state === "Selected" ? "text/on-color" : "text/secondary", state === "Selected" ? { r: 1, g: 1, b: 1 } : { r: 0.4, g: 0.4, b: 0.4 });
      chip.appendChild(text);

      components.push(chip);
      chipMap[`${state}-${size.name}`] = chip;
    }
  }

  const componentSet = figma.combineAsVariants(components, chipPage);
  componentSet.name = "Chip";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Chip Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 600;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Chip";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Chips represent small blocks of information or selections.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const stateContent = await createPropertySection(docFrame, "State", "Selection states for chips.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, chipMap[`${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, chipMap[`Default-${size.name}`]);
  }

  componentSet.description = `Chip Component

Chips represent small blocks of information or selections.

Properties:
• State: Default, Selected
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Chips created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Separator Component
// ═══════════════════════════════════════════════════════════
async function createSeparators(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let separatorPage = figma.root.children.find(p => p.name === "Separators") as PageNode | undefined;
  if (!separatorPage) { separatorPage = figma.createPage(); separatorPage.name = "Separators"; }
  separatorPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(separatorPage);

  for (const child of [...separatorPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const orientations = ["Horizontal", "Vertical"];
  const weights = [
    { name: "Thin", weight: 1 },
    { name: "Medium", weight: 2 },
    { name: "Thick", weight: 4 },
  ];

  const components: ComponentNode[] = [];
  const separatorMap: Record<string, ComponentNode> = {};

  for (const orientation of orientations) {
    for (const weight of weights) {
      const separator = figma.createComponent();
      separator.name = `Orientation=${orientation}, Weight=${weight.name}`;

      if (orientation === "Horizontal") {
        separator.resize(200, weight.weight);
      } else {
        separator.resize(weight.weight, 100);
      }

      applyVariableToFill(separator, "border/default", { r: 0.9, g: 0.9, b: 0.9 });

      components.push(separator);
      separatorMap[`${orientation}-${weight.name}`] = separator;
    }
  }

  const componentSet = figma.combineAsVariants(components, separatorPage);
  componentSet.name = "Separator";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Separator Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 500;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Separator";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Separators visually divide content into clear groups.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const orientationContent = await createPropertySection(docFrame, "Orientation", "Horizontal or vertical separators.", 0);
  for (const orientation of orientations) {
    await createValueItem(orientationContent, orientation, separatorMap[`${orientation}-Medium`]);
  }

  const weightContent = await createPropertySection(docFrame, "Weight", "Thickness variants for emphasis.", 0);
  for (const weight of weights) {
    await createValueItem(weightContent, weight.name, separatorMap[`Horizontal-${weight.name}`]);
  }

  componentSet.description = `Separator Component

Separators visually divide content into clear groups.

Properties:
• Orientation: Horizontal, Vertical
• Weight: Thin (1px), Medium (2px), Thick (4px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Separators created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Spinner Component
// ═══════════════════════════════════════════════════════════
async function createSpinners(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let spinnerPage = figma.root.children.find(p => p.name === "Spinners") as PageNode | undefined;
  if (!spinnerPage) { spinnerPage = figma.createPage(); spinnerPage.name = "Spinners"; }
  spinnerPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(spinnerPage);

  for (const child of [...spinnerPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const sizes = [
    { name: "SM", size: 16, strokeWidth: 2 },
    { name: "MD", size: 24, strokeWidth: 3 },
    { name: "LG", size: 32, strokeWidth: 4 },
    { name: "XL", size: 48, strokeWidth: 5 },
  ];

  const components: ComponentNode[] = [];
  const spinnerMap: Record<string, ComponentNode> = {};

  for (const size of sizes) {
    const spinner = figma.createComponent();
    spinner.name = `Size=${size.name}`;
    spinner.resize(size.size, size.size);

    // Create circular arc for spinner
    const arc = figma.createEllipse();
    arc.resize(size.size, size.size);
    arc.x = 0;
    arc.y = 0;
    arc.fills = [];
    arc.strokeWeight = size.strokeWidth;
    arc.strokeCap = "ROUND";
    applyVariableToStroke(arc, "interactive/primary", primaryRgb);
    arc.arcData = { startingAngle: 0, endingAngle: 4.71239, innerRadius: 0.7 }; // 270 degrees
    spinner.appendChild(arc);

    components.push(spinner);
    spinnerMap[size.name] = spinner;
  }

  const componentSet = figma.combineAsVariants(components, spinnerPage);
  componentSet.name = "Spinner";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Spinner Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 500;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Spinner";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Spinners indicate loading or processing states.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, spinnerMap[size.name]);
  }

  componentSet.description = `Spinner Component

Spinners indicate loading or processing states.

Properties:
• Size: SM (16px), MD (24px), LG (32px), XL (48px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Spinners created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Alert Component
// ═══════════════════════════════════════════════════════════
async function createAlerts(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let alertPage = figma.root.children.find(p => p.name === "Alerts") as PageNode | undefined;
  if (!alertPage) { alertPage = figma.createPage(); alertPage.name = "Alerts"; }
  alertPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(alertPage);

  for (const child of [...alertPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const types = [
    { name: "Info", bgVar: "bg/brand", textVar: "text/brand", borderVar: "border/brand", bgFallback: lighten(primaryRgb, 0.9), textFallback: primaryRgb, borderFallback: primaryRgb },
    { name: "Success", bgVar: "bg/success", textVar: "text/success", borderVar: "border/success", bgFallback: { r: 0.9, g: 0.95, b: 0.9 }, textFallback: { r: 0.13, g: 0.55, b: 0.13 }, borderFallback: { r: 0.13, g: 0.55, b: 0.13 } },
    { name: "Warning", bgVar: "bg/warning", textVar: "text/warning", borderVar: "border/warning", bgFallback: { r: 1, g: 0.95, b: 0.85 }, textFallback: { r: 0.7, g: 0.5, b: 0.05 }, borderFallback: { r: 0.95, g: 0.65, b: 0.05 } },
    { name: "Danger", bgVar: "bg/danger", textVar: "text/danger", borderVar: "border/danger", bgFallback: { r: 1, g: 0.9, b: 0.9 }, textFallback: { r: 0.7, g: 0.15, b: 0.15 }, borderFallback: { r: 0.86, g: 0.20, b: 0.20 } },
  ];

  const components: ComponentNode[] = [];
  const alertMap: Record<string, ComponentNode> = {};

  for (const type of types) {
    const alert = figma.createComponent();
    alert.name = `Type=${type.name}`;
    alert.layoutMode = "VERTICAL";
    alert.primaryAxisSizingMode = "AUTO";
    alert.counterAxisSizingMode = "FIXED";
    alert.resize(400, 100);
    alert.paddingTop = 16;
    alert.paddingBottom = 16;
    alert.paddingLeft = 16;
    alert.paddingRight = 16;
    alert.itemSpacing = 8;
    alert.cornerRadius = 8;

    applyVariableToFill(alert, type.bgVar, type.bgFallback);
    applyVariableToStroke(alert, type.borderVar, type.borderFallback);
    alert.strokeWeight = 1;

    // Title
    const title = figma.createText();
    title.fontName = { family: "Pretendard", style: "SemiBold" };
    title.fontSize = 14;
    title.characters = type.name;
    applyVariableToFill(title, type.textVar, type.textFallback);
    alert.appendChild(title);

    // Message
    const message = figma.createText();
    message.fontName = { family: "Pretendard", style: "Regular" };
    message.fontSize = 13;
    message.characters = "This is an alert message.";
    message.resize(368, message.height);
    message.textAutoResize = "HEIGHT";
    applyVariableToFill(message, type.textVar, type.textFallback);
    alert.appendChild(message);

    components.push(alert);
    alertMap[type.name] = alert;
  }

  const componentSet = figma.combineAsVariants(components, alertPage);
  componentSet.name = "Alert";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Alert Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 600;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Alert";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Alerts display important messages to users.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const typeContent = await createPropertySection(docFrame, "Type", "Alert types for different message severities.", 0);
  for (const type of types) {
    await createValueItem(typeContent, type.name, alertMap[type.name]);
  }

  componentSet.description = `Alert Component

Alerts display important messages to users.

Properties:
• Type: Info, Success, Warning, Danger`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Alerts created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Tooltip Component
// ═══════════════════════════════════════════════════════════
async function createTooltips(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let tooltipPage = figma.root.children.find(p => p.name === "Tooltips") as PageNode | undefined;
  if (!tooltipPage) { tooltipPage = figma.createPage(); tooltipPage.name = "Tooltips"; }
  tooltipPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(tooltipPage);

  for (const child of [...tooltipPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const positions = ["Top", "Bottom", "Left", "Right"];
  const sizes = [
    { name: "SM", paddingX: 8, paddingY: 4, fontSize: 11, arrowSize: 6 },
    { name: "MD", paddingX: 12, paddingY: 6, fontSize: 12, arrowSize: 8 },
    { name: "LG", paddingX: 16, paddingY: 8, fontSize: 14, arrowSize: 10 },
  ];

  const components: ComponentNode[] = [];
  const tooltipMap: Record<string, ComponentNode> = {};

  for (const position of positions) {
    for (const size of sizes) {
      const container = figma.createComponent();
      container.name = `Position=${position}, Size=${size.name}`;
      container.layoutMode = position === "Left" || position === "Right" ? "HORIZONTAL" : "VERTICAL";
      container.primaryAxisSizingMode = "AUTO";
      container.counterAxisSizingMode = "AUTO";
      container.primaryAxisAlignItems = "CENTER";
      container.counterAxisAlignItems = "CENTER";
      container.itemSpacing = 8;
      container.fills = [];

      // Trigger button - use Button Atom instance
      const triggerButtonComponent = await findAtomComponent("Buttons", "Button", {
        Type: "Secondary",
        State: "Default",
        Size: size.name
      });

      let trigger: SceneNode;
      if (triggerButtonComponent) {
        trigger = triggerButtonComponent.createInstance();
        trigger.name = "Trigger";
      } else {
        // Fallback: create simple button
        const fallbackTrigger = figma.createFrame();
        fallbackTrigger.name = "Trigger";
        fallbackTrigger.layoutMode = "HORIZONTAL";
        fallbackTrigger.primaryAxisSizingMode = "AUTO";
        fallbackTrigger.counterAxisSizingMode = "AUTO";
        fallbackTrigger.paddingLeft = 12;
        fallbackTrigger.paddingRight = 12;
        fallbackTrigger.paddingTop = 8;
        fallbackTrigger.paddingBottom = 8;
        fallbackTrigger.cornerRadius = 6;
        fallbackTrigger.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.95, b: 0.95 } }];

        const triggerText = figma.createText();
        triggerText.fontName = { family: "Pretendard", style: "Medium" };
        triggerText.fontSize = 14;
        triggerText.characters = "Hover me";
        triggerText.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.2 } }];
        fallbackTrigger.appendChild(triggerText);
        trigger = fallbackTrigger;
      }

      // Tooltip group (arrow + bubble)
      const tooltipGroup = figma.createFrame();
      tooltipGroup.name = "Tooltip";
      tooltipGroup.layoutMode = position === "Left" || position === "Right" ? "HORIZONTAL" : "VERTICAL";
      tooltipGroup.primaryAxisSizingMode = "AUTO";
      tooltipGroup.counterAxisSizingMode = "AUTO";
      tooltipGroup.primaryAxisAlignItems = "CENTER";
      tooltipGroup.counterAxisAlignItems = "CENTER";
      tooltipGroup.itemSpacing = 0;
      tooltipGroup.fills = [];

      // Tooltip bubble
      const bubble = figma.createFrame();
      bubble.name = "Bubble";
      bubble.layoutMode = "HORIZONTAL";
      bubble.primaryAxisSizingMode = "AUTO";
      bubble.counterAxisSizingMode = "AUTO";
      bubble.paddingLeft = size.paddingX;
      bubble.paddingRight = size.paddingX;
      bubble.paddingTop = size.paddingY;
      bubble.paddingBottom = size.paddingY;
      bubble.cornerRadius = 5;
      bubble.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.15 } }];

      const text = figma.createText();
      text.fontName = { family: "Pretendard", style: "Medium" };
      text.fontSize = size.fontSize;
      text.characters = "Tooltip text";
      text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      bubble.appendChild(text);

      // Arrow (triangle)
      const arrow = figma.createPolygon();
      arrow.name = "Arrow";
      arrow.resize(size.arrowSize, size.arrowSize);
      arrow.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.15 } }];

      // Assemble tooltip group and container based on position
      if (position === "Top") {
        arrow.rotation = 180;
        tooltipGroup.appendChild(bubble);
        tooltipGroup.appendChild(arrow);
        container.appendChild(tooltipGroup);
        container.appendChild(trigger);
      } else if (position === "Bottom") {
        tooltipGroup.appendChild(arrow);
        tooltipGroup.appendChild(bubble);
        container.appendChild(trigger);
        container.appendChild(tooltipGroup);
      } else if (position === "Left") {
        arrow.rotation = 90;
        tooltipGroup.appendChild(bubble);
        tooltipGroup.appendChild(arrow);
        container.appendChild(tooltipGroup);
        container.appendChild(trigger);
      } else { // Right
        arrow.rotation = -90;
        tooltipGroup.appendChild(arrow);
        tooltipGroup.appendChild(bubble);
        container.appendChild(trigger);
        container.appendChild(tooltipGroup);
      }

      components.push(container);
      tooltipMap[`${position}-${size.name}`] = container;
    }
  }

  const componentSet = figma.combineAsVariants(components, tooltipPage);
  componentSet.name = "Tooltip";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Tooltip Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Tooltip";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Tooltips provide helpful hints with directional arrows.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const posContent = await createPropertySection(docFrame, "Position", "Arrow position for tooltip placement.", 0);
  for (const pos of positions) {
    await createValueItem(posContent, pos, tooltipMap[`${pos}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, tooltipMap[`Top-${size.name}`]);
  }

  componentSet.description = `Tooltip Component

Tooltips provide helpful hints with directional arrows.

Properties:
• Position: Top, Bottom, Left, Right
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Tooltips created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Pagination Component
// ═══════════════════════════════════════════════════════════
async function createPagination(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let paginationPage = figma.root.children.find(p => p.name === "Pagination") as PageNode | undefined;
  if (!paginationPage) { paginationPage = figma.createPage(); paginationPage.name = "Pagination"; }
  paginationPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(paginationPage);

  for (const child of [...paginationPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const types = ["Simple", "Numbers", "Complete"];
  const styles = ["Bordered", "Borderless"];
  const sizes = [
    { name: "SM", buttonSize: 32, fontSize: 12, spacing: 4 },
    { name: "MD", buttonSize: 40, fontSize: 14, spacing: 6 },
    { name: "LG", buttonSize: 48, fontSize: 16, spacing: 8 },
  ];

  const components: ComponentNode[] = [];
  const paginationMap: Record<string, ComponentNode> = {};

  // Helper function to create a page button
  const createPageButton = (label: string, isActive: boolean, style: string, size: typeof sizes[0]) => {
    const btn = figma.createFrame();
    btn.name = label;
    btn.layoutMode = "HORIZONTAL";
    btn.primaryAxisSizingMode = "FIXED";
    btn.counterAxisSizingMode = "FIXED";
    btn.primaryAxisAlignItems = "CENTER";
    btn.counterAxisAlignItems = "CENTER";
    btn.resize(size.buttonSize, size.buttonSize);
    btn.cornerRadius = 4;

    if (style === "Bordered") {
      // Bordered style: has border and white background
      if (isActive) {
        applyVariableToFill(btn, "interactive/primary", primaryRgb);
      } else {
        applyVariableToFill(btn, "bg/primary", { r: 1, g: 1, b: 1 });
        applyVariableToStroke(btn, "border/default", { r: 0.9, g: 0.9, b: 0.9 });
        btn.strokeWeight = 1;
      }
    } else {
      // Borderless style: no border, subtle background
      if (isActive) {
        applyVariableToFill(btn, "interactive/primary", primaryRgb);
      } else {
        btn.fills = [];
      }
    }

    const text = figma.createText();
    text.fontName = { family: "Pretendard", style: isActive ? "Medium" : "Regular" };
    text.fontSize = size.fontSize;
    text.characters = label;

    if (style === "Bordered") {
      text.fills = [{ type: "SOLID", color: isActive ? { r: 1, g: 1, b: 1 } : { r: 0.2, g: 0.2, b: 0.2 } }];
    } else {
      text.fills = [{ type: "SOLID", color: isActive ? { r: 1, g: 1, b: 1 } : { r: 0.4, g: 0.4, b: 0.4 } }];
    }

    btn.appendChild(text);
    return btn;
  };

  for (const type of types) {
    for (const style of styles) {
      for (const size of sizes) {
        const pagination = figma.createComponent();
        pagination.name = `Type=${type}, Style=${style}, Size=${size.name}`;
        pagination.layoutMode = "HORIZONTAL";
        pagination.primaryAxisSizingMode = "AUTO";
        pagination.counterAxisSizingMode = "AUTO";
        pagination.primaryAxisAlignItems = "CENTER";
        pagination.counterAxisAlignItems = "CENTER";
        pagination.itemSpacing = size.spacing;
        pagination.fills = [];

        if (type === "Simple") {
          // [< Previous] [Next >]
          pagination.appendChild(createPageButton("<", false, style, size));
          pagination.appendChild(createPageButton(">", false, style, size));
        } else if (type === "Numbers") {
          // [1] [2] [3] [4] [5]
          for (let i = 1; i <= 5; i++) {
            pagination.appendChild(createPageButton(String(i), i === 2, style, size));
          }
        } else { // Complete
          // [< Previous] [1] [2] [3] [...] [10] [Next >]
          pagination.appendChild(createPageButton("<", false, style, size));
          pagination.appendChild(createPageButton("1", false, style, size));
          pagination.appendChild(createPageButton("2", true, style, size));
          pagination.appendChild(createPageButton("3", false, style, size));
          pagination.appendChild(createPageButton("...", false, style, size));
          pagination.appendChild(createPageButton("10", false, style, size));
          pagination.appendChild(createPageButton(">", false, style, size));
        }

        components.push(pagination);
        paginationMap[`${type}-${style}-${size.name}`] = pagination;
      }
    }
  }

  const componentSet = figma.combineAsVariants(components, paginationPage);
  componentSet.name = "Pagination";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Pagination Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Pagination";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Pagination allows users to navigate through pages of content.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const typeContent = await createPropertySection(docFrame, "Type", "Different pagination layouts.", 0);
  for (const type of types) {
    await createValueItem(typeContent, type, paginationMap[`${type}-Bordered-MD`]);
  }

  const styleContent = await createPropertySection(docFrame, "Style", "Border variants.", 0);
  for (const style of styles) {
    await createValueItem(styleContent, style, paginationMap[`Complete-${style}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, paginationMap[`Complete-Bordered-${size.name}`]);
  }

  componentSet.description = `Pagination Component

Complete pagination UI with navigation buttons and page numbers.

Properties:
• Type: Simple (prev/next), Numbers (page numbers), Complete (full navigation)
• Style: Bordered (with border), Borderless (minimal style)
• Size: SM (32px), MD (40px), LG (48px)`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Pagination created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Tab Component
// ═══════════════════════════════════════════════════════════
async function createTabs(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let tabPage = figma.root.children.find(p => p.name === "Tabs") as PageNode | undefined;
  if (!tabPage) { tabPage = figma.createPage(); tabPage.name = "Tabs"; }
  tabPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(tabPage);

  for (const child of [...tabPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);

  const styles = ["Underline", "Boxed", "Pill"];
  const states = ["Default", "Active"];
  const sizes = [
    { name: "SM", paddingX: 12, paddingY: 8, fontSize: 13, borderHeight: 2 },
    { name: "MD", paddingX: 16, paddingY: 12, fontSize: 14, borderHeight: 3 },
    { name: "LG", paddingX: 20, paddingY: 16, fontSize: 16, borderHeight: 4 },
  ];

  const components: ComponentNode[] = [];
  const tabMap: Record<string, ComponentNode> = {};

  for (const style of styles) {
    for (const state of states) {
      for (const size of sizes) {
        const tab = figma.createComponent();
        tab.name = `Style=${style}, State=${state}, Size=${size.name}`;
        tab.layoutMode = "HORIZONTAL";
        tab.primaryAxisSizingMode = "AUTO";
        tab.counterAxisSizingMode = "AUTO";
        tab.paddingLeft = size.paddingX;
        tab.paddingRight = size.paddingX;
        tab.paddingTop = size.paddingY;
        tab.paddingBottom = size.paddingY;

        const text = figma.createText();
        text.fontName = { family: "Pretendard", style: state === "Active" ? "Medium" : "Regular" };
        text.fontSize = size.fontSize;
        text.characters = "Tab";

        // Style-specific design
        if (style === "Underline") {
          tab.fills = [];
          if (state === "Active") {
            applyVariableToFill(text, "text/brand", primaryRgb);
            tab.strokeWeight = size.borderHeight;
            tab.strokeAlign = "INSIDE";
            tab.strokes = [{ type: "SOLID", color: primaryRgb }];
            tab.strokeTopWeight = 0;
            tab.strokeRightWeight = 0;
            tab.strokeLeftWeight = 0;
            tab.strokeBottomWeight = size.borderHeight;
          } else {
            applyVariableToFill(text, "text/secondary", { r: 0.5, g: 0.5, b: 0.5 });
          }
        } else if (style === "Boxed") {
          tab.cornerRadius = 6;
          if (state === "Active") {
            applyVariableToFill(tab, "bg/brand-subtle", lighten(primaryRgb, 0.9));
            applyVariableToFill(text, "text/brand", primaryRgb);
            applyVariableToStroke(tab, "border/brand", primaryRgb);
            tab.strokeWeight = 1;
          } else {
            tab.fills = [];
            applyVariableToFill(text, "text/secondary", { r: 0.5, g: 0.5, b: 0.5 });
            tab.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
            tab.strokeWeight = 1;
          }
        } else { // Pill
          tab.cornerRadius = 999;
          if (state === "Active") {
            applyVariableToFill(tab, "interactive/primary", primaryRgb);
            text.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          } else {
            applyVariableToFill(tab, "bg/secondary", { r: 0.95, g: 0.95, b: 0.95 });
            applyVariableToFill(text, "text/secondary", { r: 0.5, g: 0.5, b: 0.5 });
          }
        }

        tab.appendChild(text);
        components.push(tab);
        tabMap[`${style}-${state}-${size.name}`] = tab;
      }
    }
  }

  const componentSet = figma.combineAsVariants(components, tabPage);
  componentSet.name = "Tab";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Tab Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 800;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Tab";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Tabs in multiple styles: Underline, Boxed, and Pill.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const styleContent = await createPropertySection(docFrame, "Style", "Visual styles for tab design.", 0);
  for (const style of styles) {
    await createValueItem(styleContent, style, tabMap[`${style}-Active-MD`]);
  }

  const stateContent = await createPropertySection(docFrame, "State", "Visual states for tab items.", 0);
  for (const state of states) {
    await createValueItem(stateContent, state, tabMap[`Underline-${state}-MD`]);
  }

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different contexts.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, tabMap[`Underline-Default-${size.name}`]);
  }

  componentSet.description = `Tab Component

Tabs in multiple styles: Underline, Boxed, and Pill.

Properties:
• Style: Underline, Boxed, Pill
• State: Default, Active
• Size: SM, MD, LG`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Tabs created! (" + components.length + " variants)", "success");
}

// ═══════════════════════════════════════════════════════════
// Modal Component
// ═══════════════════════════════════════════════════════════
async function createModals(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });

  let modalPage = figma.root.children.find(p => p.name === "Modals") as PageNode | undefined;
  if (!modalPage) { modalPage = figma.createPage(); modalPage.name = "Modals"; }
  modalPage.backgrounds = [LIGHT_BG];
  await figma.setCurrentPageAsync(modalPage);

  for (const child of [...modalPage.children]) {
    try { child.remove(); } catch (e) { /* skip */ }
  }

  const primaryRgb = hexToRgb(colors.primary);
  const sizes = [
    { name: "SM", width: 400, contentHeight: 100, buttonHeight: 36, buttonWidth: 80 },
    { name: "MD", width: 560, contentHeight: 160, buttonHeight: 40, buttonWidth: 100 },
    { name: "LG", width: 720, contentHeight: 240, buttonHeight: 44, buttonWidth: 120 },
  ];
  const actionTypes = ["None", "Single", "Double"];

  const components: ComponentNode[] = [];
  const modalMap: Record<string, ComponentNode> = {};

  for (const size of sizes) {
    for (const actionType of actionTypes) {
      // Create backdrop + modal container
      const container = figma.createComponent();
      container.name = `Size=${size.name}, Actions=${actionType}`;
      container.layoutMode = "NONE";
      container.resize(size.width + 200, size.contentHeight + 300);
      container.fills = [];

      // Backdrop (semi-transparent overlay)
      const backdrop = figma.createFrame();
      backdrop.name = "Backdrop";
      backdrop.resize(size.width + 200, size.contentHeight + 300);
      backdrop.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.4 }];
      backdrop.x = 0;
      backdrop.y = 0;
      container.appendChild(backdrop);

      // Modal box
      const modal = figma.createFrame();
      modal.name = "Modal";
      modal.layoutMode = "VERTICAL";
      modal.primaryAxisSizingMode = "AUTO";
      modal.counterAxisSizingMode = "FIXED";
      modal.resize(size.width, 100);
      modal.paddingTop = 20;
      modal.paddingBottom = 20;
      modal.paddingLeft = 24;
      modal.paddingRight = 24;
      modal.itemSpacing = 16;
      modal.cornerRadius = 16;
      modal.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
      modal.effects = [{
        type: "DROP_SHADOW",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 8 },
        radius: 24,
        visible: true,
        blendMode: "NORMAL"
      }];

      // Center modal
      modal.x = (size.width + 200 - size.width) / 2;
      modal.y = (size.contentHeight + 300 - (size.contentHeight + 150)) / 2;
      container.appendChild(modal);

      // Header with title and close button
      const header = figma.createFrame();
      header.name = "Header";
      header.layoutMode = "HORIZONTAL";
      header.primaryAxisSizingMode = "FIXED";
      header.counterAxisSizingMode = "AUTO";
      header.primaryAxisAlignItems = "SPACE_BETWEEN";
      header.counterAxisAlignItems = "CENTER";
      header.resize(size.width - 48, 28);
      header.fills = [];

      const title = figma.createText();
      title.fontName = { family: "Pretendard", style: "SemiBold" };
      title.fontSize = 18;
      title.characters = "Modal Title";
      title.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.1 } }];
      header.appendChild(title);

      // Close button
      const closeButton = figma.createFrame();
      closeButton.name = "Close Button";
      closeButton.resize(32, 32);
      closeButton.layoutMode = "HORIZONTAL";
      closeButton.primaryAxisAlignItems = "CENTER";
      closeButton.counterAxisAlignItems = "CENTER";
      closeButton.fills = [];
      closeButton.cornerRadius = 6;
      closeButton.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.91 } }];
      closeButton.strokeWeight = 1;

      const closeIcon = figma.createText();
      closeIcon.fontName = { family: "Pretendard", style: "Bold" };
      closeIcon.fontSize = 24;
      closeIcon.characters = "×";
      closeIcon.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.55 } }];
      closeButton.appendChild(closeIcon);
      header.appendChild(closeButton);

      modal.appendChild(header);

      // Content
      const content = figma.createFrame();
      content.name = "Content";
      content.layoutMode = "VERTICAL";
      content.primaryAxisSizingMode = "FIXED";
      content.counterAxisSizingMode = "FIXED";
      content.resize(size.width - 48, size.contentHeight);
      content.fills = [];

      const bodyText = figma.createText();
      bodyText.fontName = { family: "Pretendard", style: "Regular" };
      bodyText.fontSize = 14;
      bodyText.lineHeight = { value: 150, unit: "PERCENT" };
      bodyText.characters = "This is the modal content area. You can place any information, forms, or other content here.";
      bodyText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.4 } }];
      bodyText.resize(size.width - 48, bodyText.height);
      bodyText.textAutoResize = "HEIGHT";
      content.appendChild(bodyText);

      modal.appendChild(content);

      // Footer with action buttons
      if (actionType !== "None") {
        // Divider before footer
        const divider = figma.createRectangle();
        divider.name = "Divider";
        divider.resize(size.width - 48, 1);
        divider.fills = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.91 } }];
        modal.appendChild(divider);

        const footer = figma.createFrame();
        footer.name = "Footer";
        footer.layoutMode = "HORIZONTAL";
        footer.primaryAxisSizingMode = "FIXED";
        footer.counterAxisSizingMode = "AUTO";
        footer.primaryAxisAlignItems = "MAX";
        footer.counterAxisAlignItems = "CENTER";
        footer.resize(size.width - 48, size.buttonHeight);
        footer.itemSpacing = 12;
        footer.fills = [];

        if (actionType === "Double") {
          // Cancel button - use Button Atom instance
          const cancelButtonComponent = await findAtomComponent("Buttons", "Button", {
            Type: "Secondary",
            State: "Default",
            Size: "MD"
          });

          if (cancelButtonComponent) {
            const cancelButton = cancelButtonComponent.createInstance();
            cancelButton.name = "Cancel Button";
            cancelButton.resize(size.buttonWidth, size.buttonHeight);
            footer.appendChild(cancelButton);
          } else {
            // Fallback: create manually if Button component doesn't exist
            const cancelButton = figma.createFrame();
            cancelButton.name = "Cancel";
            cancelButton.resize(size.buttonWidth, size.buttonHeight);
            cancelButton.layoutMode = "HORIZONTAL";
            cancelButton.primaryAxisAlignItems = "CENTER";
            cancelButton.counterAxisAlignItems = "CENTER";
            cancelButton.cornerRadius = 8;
            cancelButton.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
            cancelButton.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.9 } }];
            cancelButton.strokeWeight = 1;

            const cancelText = figma.createText();
            cancelText.fontName = { family: "Pretendard", style: "Bold" };
            cancelText.fontSize = 14;
            cancelText.characters = "Cancel";
            cancelText.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.55 } }];
            cancelButton.appendChild(cancelText);
            footer.appendChild(cancelButton);
          }
        }

        // Confirm/Submit button - use Button Atom instance
        const confirmButtonComponent = await findAtomComponent("Buttons", "Button", {
          Type: "Primary",
          State: "Default",
          Size: "MD"
        });

        if (confirmButtonComponent) {
          const confirmButton = confirmButtonComponent.createInstance();
          confirmButton.name = "Confirm Button";
          confirmButton.resize(size.buttonWidth, size.buttonHeight);
          footer.appendChild(confirmButton);
        } else {
          // Fallback: create manually if Button component doesn't exist
          const confirmButton = figma.createFrame();
          confirmButton.name = "Confirm";
          confirmButton.resize(size.buttonWidth, size.buttonHeight);
          confirmButton.layoutMode = "HORIZONTAL";
          confirmButton.primaryAxisAlignItems = "CENTER";
          confirmButton.counterAxisAlignItems = "CENTER";
          confirmButton.cornerRadius = 8;
          applyVariableToFill(confirmButton, "interactive/primary", primaryRgb);

          const confirmText = figma.createText();
          confirmText.fontName = { family: "Pretendard", style: "Bold" };
          confirmText.fontSize = 14;
          confirmText.characters = actionType === "Single" ? "OK" : "Confirm";
          confirmText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
          confirmButton.appendChild(confirmText);
          footer.appendChild(confirmButton);
        }

        modal.appendChild(footer);
      }

      components.push(container);
      modalMap[`${size.name}-${actionType}`] = container;
    }
  }

  const componentSet = figma.combineAsVariants(components, modalPage);
  componentSet.name = "Modal";
  componentSet.x = 100;
  componentSet.y = 100;
  componentSet.visible = false;

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Modal Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 3000;
  docFrame.y = 100;
  docFrame.fills = [];

  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Modal";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "Modals with backdrop overlay, close button, and action buttons. Focus user attention on specific tasks.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  const sizeContent = await createPropertySection(docFrame, "Size", "Size variants for different content lengths.", 0);
  for (const size of sizes) {
    await createValueItem(sizeContent, size.name, modalMap[`${size.name}-Double`]);
  }

  const actionsContent = await createPropertySection(docFrame, "Actions", "Different button configurations.", 1);
  for (const actionType of actionTypes) {
    await createValueItem(actionsContent, actionType, modalMap[`MD-${actionType}`]);
  }

  componentSet.description = `Modal Component

Modals with backdrop overlay, close button, and action buttons. Focus user attention on specific tasks.

Properties:
• Size: SM (400px), MD (560px), LG (720px)
• Actions: None, Single (OK button), Double (Cancel + Confirm buttons)

Features:
• Semi-transparent backdrop overlay
• Close button (X) in header
• Configurable action buttons in footer`;

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus("Modals created! (" + components.length + " variants)", "success");
}

async function createIcons() {
  sendStatus("Creating icons...");

  // Load fonts
  await figma.loadFontAsync({ family: "Pretendard", style: "Regular" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Bold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "SemiBold" });
  await figma.loadFontAsync({ family: "Pretendard", style: "Medium" });

  const iconsPage = figma.root.findOne(node => node.name === "Icons" && node.type === "PAGE") as PageNode;
  if (!iconsPage) {
    sendStatus("Icons page not found! Create pages first.", "error");
    return;
  }

  // Clear existing content
  iconsPage.children.forEach(child => child.remove());

  // Create documentation frame
  const docFrame = figma.createFrame();
  docFrame.name = "Icon Documentation";
  docFrame.layoutMode = "VERTICAL";
  docFrame.primaryAxisSizingMode = "AUTO";
  docFrame.counterAxisSizingMode = "AUTO";
  docFrame.itemSpacing = 32;
  docFrame.x = 100;
  docFrame.y = 100;
  docFrame.fills = [];
  iconsPage.appendChild(docFrame);

  // Title section
  const titleFrame = figma.createFrame();
  titleFrame.name = "Title";
  titleFrame.layoutMode = "VERTICAL";
  titleFrame.primaryAxisSizingMode = "AUTO";
  titleFrame.counterAxisSizingMode = "AUTO";
  titleFrame.itemSpacing = 8;
  titleFrame.fills = [];

  const mainTitle = figma.createText();
  mainTitle.fontName = { family: "Pretendard", style: "Bold" };
  mainTitle.fontSize = 30;
  mainTitle.letterSpacing = { value: -0.6, unit: "PIXELS" };
  mainTitle.characters = "Icons";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Pretendard", style: "Regular" };
  mainDesc.fontSize = 14;
  mainDesc.letterSpacing = { value: -0.28, unit: "PIXELS" };
  mainDesc.characters = "System icons for interface elements and actions.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.0, g: 0.0, b: 0.0 } }];
  titleFrame.appendChild(mainDesc);

  docFrame.appendChild(titleFrame);

  let totalIconsCreated = 0;

  // Size descriptions
  const sizeDescriptions: Record<string, string> = {
    "10px": "Mini icons for compact UI elements and inline usage.",
    "14px": "Small icons for buttons, inputs, and standard interface elements.",
    "18px": "Medium icons for emphasis and larger touch targets.",
    "24px": "Large icons for headers and prominent actions.",
    "weather": "Weather condition icons for environmental data display."
  };

  // Process each size category
  for (const [sizeLabel, icons] of Object.entries(ICONS_DATA)) {
    const section = figma.createFrame();
    section.name = `_Property: ${sizeLabel}`;
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.itemSpacing = 16;
    section.paddingTop = 24;
    section.paddingBottom = 24;
    section.paddingLeft = 24;
    section.paddingRight = 24;
    section.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    section.cornerRadius = 12;
    section.strokes = [{ type: "SOLID", color: { r: 0.9, g: 0.9, b: 0.92 } }];
    section.strokeWeight = 1;

    // Header
    const header = figma.createFrame();
    header.name = "Header";
    header.layoutMode = "VERTICAL";
    header.primaryAxisSizingMode = "AUTO";
    header.counterAxisSizingMode = "AUTO";
    header.itemSpacing = 4;
    header.fills = [];

    const titleText = figma.createText();
    titleText.fontName = { family: "Pretendard", style: "SemiBold" };
    titleText.fontSize = 14;
    titleText.characters = `${sizeLabel} (${icons.length} icons)`;
    titleText.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.15 } }];
    header.appendChild(titleText);

    const descText = figma.createText();
    descText.fontName = { family: "Pretendard", style: "Regular" };
    descText.fontSize = 12;
    descText.characters = sizeDescriptions[sizeLabel] || "";
    descText.fills = [{ type: "SOLID", color: { r: 0.5, g: 0.5, b: 0.55 } }];
    header.appendChild(descText);

    section.appendChild(header);

    // Icons grid with wrapping
    const iconsGrid = figma.createFrame();
    iconsGrid.name = "Content";
    iconsGrid.layoutMode = "HORIZONTAL";
    iconsGrid.primaryAxisSizingMode = "FIXED";
    iconsGrid.counterAxisSizingMode = "AUTO";
    iconsGrid.resize(1000, 100); // Fixed width for wrapping
    iconsGrid.itemSpacing = 16;
    iconsGrid.counterAxisSpacing = 16;
    iconsGrid.layoutWrap = "WRAP";
    iconsGrid.fills = [];
    section.appendChild(iconsGrid);

    // Process icons
    for (const iconData of icons) {
      try {
        // Create icon container (no background)
        const iconContainer = figma.createFrame();
        iconContainer.name = iconData.name;
        iconContainer.fills = [];
        iconContainer.layoutMode = "VERTICAL";
        iconContainer.primaryAxisSizingMode = "AUTO";
        iconContainer.counterAxisSizingMode = "AUTO";
        iconContainer.itemSpacing = 4;
        iconContainer.counterAxisAlignItems = "CENTER";

        // Create SVG node from string (no background frame)
        const svgNode = figma.createNodeFromSvg(iconData.svg);
        svgNode.name = iconData.name;
        iconContainer.appendChild(svgNode);

        // Create label
        const labelText = figma.createText();
        labelText.fontName = { family: "Pretendard", style: "Regular" };
        labelText.fontSize = 9;
        const cleanName = iconData.name.replace(`${sizeLabel}-`, '').replace('weather-', '');
        labelText.characters = cleanName.length > 10 ? cleanName.substring(0, 9) + '...' : cleanName;
        labelText.fills = [{ type: "SOLID", color: { r: 0.45, g: 0.45, b: 0.5 } }];
        iconContainer.appendChild(labelText);

        iconsGrid.appendChild(iconContainer);
        totalIconsCreated++;
      } catch (error) {
        console.error(`Failed to create icon ${iconData.name}:`, error);
      }
    }

    docFrame.appendChild(section);
  }

  figma.viewport.scrollAndZoomIntoView([docFrame]);
  sendStatus(`Icons created! (${totalIconsCreated} icons)`, "success");
}

async function createAll(colors: { primary: string; secondary: string }) {
  try {
    sendStatus("1/29 Creating pages...");
    await createPages();
    sendStatus("2/29 Creating variables...");
    await createVariables(colors);
    sendStatus("3/29 Creating typography...");
    await createTypography();
    sendStatus("4/29 Creating colors...");
    await createColors(colors);
    sendStatus("5/29 Creating icons...");
    await createIcons();
    sendStatus("6/29 Creating buttons...");
    await createButtons(colors);
    sendStatus("7/29 Creating cards...");
    await createCards(colors);
    sendStatus("8/29 Creating badges...");
    await createBadges(colors);
    sendStatus("9/29 Creating inputs...");
    await createInputs(colors);
    sendStatus("10/29 Creating checkboxes...");
    await createCheckboxes(colors);
    sendStatus("11/29 Creating radios...");
    await createRadios(colors);
    sendStatus("12/29 Creating switches...");
    await createSwitches(colors);
    sendStatus("13/29 Creating avatars...");
    await createAvatars(colors);
    sendStatus("14/29 Creating labels...");
    await createLabels(colors);
    sendStatus("15/29 Creating links...");
    await createLinks(colors);
    sendStatus("16/29 Creating textareas...");
    await createTextareas(colors);
    sendStatus("17/29 Creating progress bars...");
    await createProgressBars(colors);
    sendStatus("18/29 Creating skeletons...");
    await createSkeletons(colors);
    sendStatus("19/29 Creating sliders...");
    await createSliders(colors);
    sendStatus("20/29 Creating toggles...");
    await createToggles(colors);
    sendStatus("21/29 Creating chips...");
    await createChips(colors);
    sendStatus("22/29 Creating separators...");
    await createSeparators(colors);
    sendStatus("23/29 Creating spinners...");
    await createSpinners(colors);
    sendStatus("24/29 Creating alerts...");
    await createAlerts(colors);
    sendStatus("25/29 Creating tooltips...");
    await createTooltips(colors);
    sendStatus("26/29 Creating pagination...");
    await createPagination(colors);
    sendStatus("27/29 Creating tabs...");
    await createTabs(colors);
    sendStatus("28/29 Creating modals...");
    await createModals(colors);
    sendStatus("29/29 Design system complete!", "success");
  } catch (error) {
    sendStatus("Error: " + error, "error");
  }
}

figma.ui.onmessage = async (msg) => {
  try {
    switch (msg.type) {
      case "create-pages": await createPages(); break;
      case "create-variables": await createVariables(msg.colors); break;
      case "create-typography": await createTypography(); break;
      case "create-colors": await createColors(msg.colors); break;
      case "create-icons": await createIcons(); break;
      case "create-buttons": await createButtons(msg.colors); break;
      case "create-cards": await createCards(msg.colors); break;
      case "create-badges": await createBadges(msg.colors); break;
      case "create-inputs": await createInputs(msg.colors); break;
      case "create-checkboxes": await createCheckboxes(msg.colors); break;
      case "create-radios": await createRadios(msg.colors); break;
      case "create-switches": await createSwitches(msg.colors); break;
      case "create-avatars": await createAvatars(msg.colors); break;
      case "create-labels": await createLabels(msg.colors); break;
      case "create-links": await createLinks(msg.colors); break;
      case "create-textareas": await createTextareas(msg.colors); break;
      case "create-progress": await createProgressBars(msg.colors); break;
      case "create-skeletons": await createSkeletons(msg.colors); break;
      case "create-sliders": await createSliders(msg.colors); break;
      case "create-toggles": await createToggles(msg.colors); break;
      case "create-chips": await createChips(msg.colors); break;
      case "create-separators": await createSeparators(msg.colors); break;
      case "create-spinners": await createSpinners(msg.colors); break;
      case "create-alerts": await createAlerts(msg.colors); break;
      case "create-tooltips": await createTooltips(msg.colors); break;
      case "create-pagination": await createPagination(msg.colors); break;
      case "create-tabs": await createTabs(msg.colors); break;
      case "create-modals": await createModals(msg.colors); break;
      case "create-all": await createAll(msg.colors); break;
    }
  } catch (error) {
    sendStatus("Error: " + error, "error");
  }
};
