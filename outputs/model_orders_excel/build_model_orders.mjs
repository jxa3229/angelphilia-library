import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "D:/Project/angelphilia-library/outputs/model_orders_excel";
await fs.mkdir(outputDir, { recursive: true });

const rows = [
  ["下单时间", "拥有人", "项目", "规格", "数量", "实付金额", "预计出货时间", "备注"],
  ["2025.6", "-", "AP", "白M头", 2, "218*2", "-", "总价476，实付218*2"],
  ["2025.6", "-", "AP", "超白H素体", 2, "2380*2", "-", "总价4960，实付2380*2"],
  ["2025.6", "LP", "AP", "超白H素体", 1, 2420, "2026年中", "-"],
  ["2025.8", "-", "AP", "褐肌美月第一批M头H体C小腿OB50手脚", 1, 2762, "2026夏后", "总价2852，实付2762"],
  ["2025.8", "-", "AP", "褐肌瑠音第一批0.5褐肌头体", 1, 2998, "2026冬后", "总价3078，实付2998，可能送手臂"],
  ["2025.8", "LP", "AP", "褐肌美月第二批", 1, 2792, "2026冬后", "-"],
  ["2025.10", "-", "AP", "超白G胸", 1, 278, "2026冬-2027", "三款胸合计278*3，总实付764"],
  ["2025.10", "-", "AP", "超白C5胸", 1, 278, "2026冬-2027", "三款胸合计278*3，总实付764"],
  ["2025.10", "-", "AP", "超白C1胸", 1, 278, "2026冬-2027", "三款胸合计278*3，总实付764"],
  ["2025.10", "LP", "AP", "超白F胸", 1, 274, "2026冬-2027", "三款胸合计总实付774"],
  ["2025.10", "LP", "AP", "白G胸", 1, 250, "2026冬-2027", "三款胸合计总实付774"],
  ["2025.10", "LP", "AP", "白C5胸", 1, 250, "2026冬-2027", "三款胸合计总实付774"],
  ["2025.12", "-", "AP", "白肌美红瑠第一批J头h体", 1, 2852, "26年末-27年出货", "-"],
  ["2026.1", "-", "AP", "11月余单白M头", 1, 213, "27年中", "总价238，实付213"],
  ["-", "-", "老杰克的人形馆", "针刺reload四分夜黑靴子", 2, "定金482已付，尾款1482-2包邮", "26年中", "-"],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("订单记录");
sheet.showGridLines = false;

sheet.getRange("A1:H16").values = rows;
sheet.getRange("A1:H1").format = {
  fill: "#1F2937",
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
};
sheet.getRange("A1:H16").format.borders = { preset: "all", style: "thin", color: "#D1D5DB" };
sheet.getRange("A2:H16").format = {
  font: { color: "#111827" },
  verticalAlignment: "top",
  wrapText: true,
};
sheet.getRange("A2:C16").format.horizontalAlignment = "left";
sheet.getRange("D2:D16").format.horizontalAlignment = "left";
sheet.getRange("E2:E16").format.horizontalAlignment = "center";
sheet.getRange("F2:F16").format.horizontalAlignment = "left";
sheet.getRange("G2:H16").format.horizontalAlignment = "left";

sheet.getRange("A:A").format.columnWidth = 11;
sheet.getRange("B:B").format.columnWidth = 9;
sheet.getRange("C:C").format.columnWidth = 18;
sheet.getRange("D:D").format.columnWidth = 38;
sheet.getRange("E:E").format.columnWidth = 7;
sheet.getRange("F:F").format.columnWidth = 28;
sheet.getRange("G:G").format.columnWidth = 20;
sheet.getRange("H:H").format.columnWidth = 34;
sheet.getRange("1:1").format.rowHeight = 28;
sheet.getRange("2:16").format.rowHeight = 32;
sheet.freezePanes.freezeRows(1);

const table = sheet.tables.add("A1:H16", true, "ModelOrderTable");
table.style = "TableStyleMedium2";
table.showFilterButton = true;

const inspect = await workbook.inspect({
  kind: "table",
  range: "订单记录!A1:H16",
  include: "values",
  tableMaxRows: 20,
  tableMaxCols: 8,
});
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "订单记录",
  autoCrop: "all",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputDir}/订单记录_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(`${outputDir}/订单记录.xlsx`);
console.log(`${outputDir}/订单记录.xlsx`);
