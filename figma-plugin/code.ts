// PF Design System Generator - Figma Plugin
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
  label.fontName = { family: "Inter", style: "Medium" };
  label.fontSize = 11;
  label.characters = text;
  label.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.45 } }];
  annotation.appendChild(label);
  parent.appendChild(annotation);
  return annotation;
}

async function createPages() {
  const pageNames = ["Cover", "---", "Foundations", "Icons", "---", "Components / Buttons", "Components / Inputs", "Components / Cards", "---", "Templates", "Playground"];
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
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

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
    { name: "Title / MD", size: 32, weight: "Semi Bold", lineHeight: 40 },
    { name: "Title / SM", size: 24, weight: "Semi Bold", lineHeight: 32 },
  ];

  let yOffset = 50;
  for (const t of titles) {
    const text = figma.createText();
    text.fontName = { family: "Inter", style: t.weight };
    text.fontSize = t.size;
    text.lineHeight = { value: t.lineHeight, unit: "PIXELS" };
    text.characters = t.name;
    text.x = 50; text.y = yOffset;
    titleSection.appendChild(text);
    yOffset += t.lineHeight + 20;

    const style = figma.createTextStyle();
    style.name = t.name;
    style.fontName = { family: "Inter", style: t.weight };
    style.fontSize = t.size;
    style.lineHeight = { value: t.lineHeight, unit: "PIXELS" };
  }

  const headingSection = figma.createSection();
  headingSection.name = "Heading";
  headingSection.x = 100; headingSection.y = 550;
  headingSection.resizeWithoutConstraints(800, 350);
  section.appendChild(headingSection);

  const headings = [
    { name: "Heading / H1", size: 28, weight: "Semi Bold", lineHeight: 36 },
    { name: "Heading / H2", size: 24, weight: "Semi Bold", lineHeight: 32 },
    { name: "Heading / H3", size: 20, weight: "Medium", lineHeight: 28 },
    { name: "Heading / H4", size: 18, weight: "Medium", lineHeight: 26 },
    { name: "Heading / H5", size: 16, weight: "Medium", lineHeight: 24 },
    { name: "Heading / H6", size: 14, weight: "Medium", lineHeight: 20 },
  ];

  yOffset = 50;
  for (const h of headings) {
    const text = figma.createText();
    text.fontName = { family: "Inter", style: h.weight };
    text.fontSize = h.size;
    text.lineHeight = { value: h.lineHeight, unit: "PIXELS" };
    text.characters = h.name;
    text.x = 50; text.y = yOffset;
    headingSection.appendChild(text);
    yOffset += h.lineHeight + 12;

    const style = figma.createTextStyle();
    style.name = h.name;
    style.fontName = { family: "Inter", style: h.weight };
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
    text.fontName = { family: "Inter", style: b.weight };
    text.fontSize = b.size;
    text.lineHeight = { value: b.lineHeight, unit: "PIXELS" };
    text.characters = b.name + " - The quick brown fox jumps over the lazy dog.";
    text.x = 50; text.y = yOffset;
    bodySection.appendChild(text);
    yOffset += b.lineHeight + 16;

    const style = figma.createTextStyle();
    style.name = b.name;
    style.fontName = { family: "Inter", style: b.weight };
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
  title.fontName = { family: "Inter", style: "Medium" };
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
    label.fontName = { family: "Inter", style: "Medium" };
    label.fontSize = 12;
    label.characters = shade.name.split("/")[1] || shade.name;
    label.fills = [{ type: "SOLID", color: { r: 0.3, g: 0.3, b: 0.3 } }];
    swatchFrame.appendChild(label);
    // Color Styles 제거 - Variables만 사용
  }
}

async function createColors(colors: { primary: string; secondary: string }) {
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

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
  titleText.fontName = { family: "Inter", style: "Semi Bold" };
  titleText.fontSize = 14;
  titleText.characters = title;
  titleText.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.15 } }];
  header.appendChild(titleText);

  const descText = figma.createText();
  descText.fontName = { family: "Inter", style: "Regular" };
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
  labelText.fontName = { family: "Inter", style: "Medium" };
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
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  let buttonsPage = figma.root.children.find(p => p.name === "Components / Buttons") as PageNode | undefined;
  if (!buttonsPage) { buttonsPage = figma.createPage(); buttonsPage.name = "Components / Buttons"; }
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
        text.fontName = { family: "Inter", style: "Semi Bold" };
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
  mainTitle.fontName = { family: "Inter", style: "Bold" };
  mainTitle.fontSize = 32;
  mainTitle.characters = "Button";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.12 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Inter", style: "Regular" };
  mainDesc.fontSize = 16;
  mainDesc.characters = "Buttons allow users to take actions with a single tap.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.45 } }];
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
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  let cardsPage = figma.root.children.find(p => p.name === "Components / Cards") as PageNode | undefined;
  if (!cardsPage) { cardsPage = figma.createPage(); cardsPage.name = "Components / Cards"; }
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
      header.fontName = { family: "Inter", style: "Semi Bold" };
      header.fontSize = size.name === "SM" ? 14 : size.name === "MD" ? 16 : 18;
      header.characters = "Card Title";
      applyVariableToFill(header, "text/primary", { r: 0.07, g: 0.07, b: 0.07 });
      card.appendChild(header);

      // Card Content
      const content = figma.createText();
      content.fontName = { family: "Inter", style: "Regular" };
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
  mainTitle.fontName = { family: "Inter", style: "Bold" };
  mainTitle.fontSize = 32;
  mainTitle.characters = "Card";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.12 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Inter", style: "Regular" };
  mainDesc.fontSize = 16;
  mainDesc.characters = "Cards contain content and actions about a single subject.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.45 } }];
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
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });

  let badgesPage = figma.root.children.find(p => p.name === "Components / Badges") as PageNode | undefined;
  if (!badgesPage) { badgesPage = figma.createPage(); badgesPage.name = "Components / Badges"; }
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
      text.fontName = { family: "Inter", style: "Medium" };
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
  mainTitle.fontName = { family: "Inter", style: "Bold" };
  mainTitle.fontSize = 32;
  mainTitle.characters = "Badge";
  mainTitle.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.12 } }];
  titleFrame.appendChild(mainTitle);

  const mainDesc = figma.createText();
  mainDesc.fontName = { family: "Inter", style: "Regular" };
  mainDesc.fontSize = 16;
  mainDesc.characters = "Badges are used to highlight status or category.";
  mainDesc.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.45 } }];
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

async function createAll(colors: { primary: string; secondary: string }) {
  try {
    sendStatus("1/7 Creating pages...");
    await createPages();
    sendStatus("2/7 Creating variables...");
    await createVariables(colors);
    sendStatus("3/7 Creating typography...");
    await createTypography();
    sendStatus("4/7 Creating colors...");
    await createColors(colors);
    sendStatus("5/7 Creating buttons...");
    await createButtons(colors);
    sendStatus("6/7 Creating cards...");
    await createCards(colors);
    sendStatus("7/7 Creating badges...");
    await createBadges(colors);
    sendStatus("Design system complete!", "success");
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
      case "create-buttons": await createButtons(msg.colors); break;
      case "create-cards": await createCards(msg.colors); break;
      case "create-badges": await createBadges(msg.colors); break;
      case "create-all": await createAll(msg.colors); break;
    }
  } catch (error) {
    sendStatus("Error: " + error, "error");
  }
};
