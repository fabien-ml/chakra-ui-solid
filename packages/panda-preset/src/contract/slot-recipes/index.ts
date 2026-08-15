import type { RecipeShape } from "../index";
import { accordionShape } from "./accordion";
import { actionBarShape } from "./action-bar";
import { alertShape } from "./alert";
import { avatarShape } from "./avatar";
import { blockquoteShape } from "./blockquote";
import { breadcrumbShape } from "./breadcrumb";
import { cardShape } from "./card";
import { carouselShape } from "./carousel";
import { checkboxShape } from "./checkbox";
import { checkboxCardShape } from "./checkbox-card";
import { codeBlockShape } from "./code-block";
import { collapsibleShape } from "./collapsible";
import { colorPickerShape } from "./color-picker";
import { comboboxShape } from "./combobox";
import { dataListShape } from "./data-list";
import { datePickerShape } from "./date-picker";
import { dialogShape } from "./dialog";
import { drawerShape } from "./drawer";
import { editableShape } from "./editable";
import { emptyStateShape } from "./empty-state";
import { fieldShape } from "./field";
import { fieldsetShape } from "./fieldset";
import { fileUploadShape } from "./file-upload";
import { floatingPanelShape } from "./floating-panel";
import { hoverCardShape } from "./hover-card";
import { listShape } from "./list";
import { listboxShape } from "./listbox";
import { marqueeShape } from "./marquee";
import { menuShape } from "./menu";
import { nativeSelectShape } from "./native-select";
import { numberInputShape } from "./number-input";
import { pinInputShape } from "./pin-input";
import { popoverShape } from "./popover";
import { progressShape } from "./progress";
import { progressCircleShape } from "./progress-circle";
import { qrCodeShape } from "./qr-code";
import { radioCardShape } from "./radio-card";
import { radioGroupShape } from "./radio-group";
import { ratingGroupShape } from "./rating-group";
import { scrollAreaShape } from "./scroll-area";
import { segmentGroupShape } from "./segment-group";
import { selectShape } from "./select";
import { sliderShape } from "./slider";
import { splitterShape } from "./splitter";
import { statShape } from "./stat";
import { statusShape } from "./status";
import { stepsShape } from "./steps";
import { switchShape } from "./switch";
import { tableShape } from "./table";
import { tabsShape } from "./tabs";
import { tagShape } from "./tag";
import { tagsInputShape } from "./tags-input";
import { timelineShape } from "./timeline";
import { toastShape } from "./toast";
import { tooltipShape } from "./tooltip";
import { treeViewShape } from "./tree-view";

/**
 * The 56 slot recipes, one file each, named after the vendored body it pins in
 * `chakra/slot-recipes/` — including `switch.ts`, which holds the misspelled `swittch` key.
 * What a row means, and why these are typed out rather than read off the loaded preset, is in
 * `../index.ts`.
 *
 * **The key order is upstream's barrel order and is load-bearing** — `preset.ts` and `config.ts`
 * both walk it.
 */
export const slotRecipeContract = {
  accordion: accordionShape,
  actionBar: actionBarShape,
  alert: alertShape,
  avatar: avatarShape,
  blockquote: blockquoteShape,
  breadcrumb: breadcrumbShape,
  card: cardShape,
  carousel: carouselShape,
  checkbox: checkboxShape,
  checkboxCard: checkboxCardShape,
  codeBlock: codeBlockShape,
  collapsible: collapsibleShape,
  dataList: dataListShape,
  datePicker: datePickerShape,
  dialog: dialogShape,
  drawer: drawerShape,
  editable: editableShape,
  emptyState: emptyStateShape,
  field: fieldShape,
  fieldset: fieldsetShape,
  fileUpload: fileUploadShape,
  hoverCard: hoverCardShape,
  list: listShape,
  listbox: listboxShape,
  menu: menuShape,
  nativeSelect: nativeSelectShape,
  numberInput: numberInputShape,
  pinInput: pinInputShape,
  popover: popoverShape,
  progress: progressShape,
  progressCircle: progressCircleShape,
  radioCard: radioCardShape,
  radioGroup: radioGroupShape,
  ratingGroup: ratingGroupShape,
  scrollArea: scrollAreaShape,
  segmentGroup: segmentGroupShape,
  select: selectShape,
  combobox: comboboxShape,
  slider: sliderShape,
  splitter: splitterShape,
  stat: statShape,
  steps: stepsShape,
  swittch: switchShape,
  table: tableShape,
  tabs: tabsShape,
  tag: tagShape,
  tagsInput: tagsInputShape,
  toast: toastShape,
  tooltip: tooltipShape,
  status: statusShape,
  timeline: timelineShape,
  colorPicker: colorPickerShape,
  qrCode: qrCodeShape,
  treeView: treeViewShape,
  marquee: marqueeShape,
  floatingPanel: floatingPanelShape,
} as const satisfies Record<string, RecipeShape>;
