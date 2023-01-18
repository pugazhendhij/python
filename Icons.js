import React from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import {
  faCheck,
  faTimes,
  faPlus,
  faSave,
  faWindowClose,
  faArrowCircleLeft,
  faStop,
  faMinus,
  faWindowMaximize,
  faWindowMinimize,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faFilePdf,
  faFileExcel,
  faPlayCircle,
  faChevronCircleDown,
  faChevronCircleUp,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faThumbsUp,
  faSearch,
  faUndoAlt,
  faUndo,
  faEraser,
  faImage,
  faTrash,
  faMoneyBill,
  faCreditCard,
  faMoneyCheckAlt,
  faMoneyBillAlt,
  faColumns,
  faEdit,
  faPlusCircle,
  faTicketAlt,
  faThumbsDown,
  faExchangeAlt,
  faRedo,
  faFilter,
  faCalendarAlt,
  faPrint,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faThumbsUp } from "@fortawesome/free-regular-svg-icons";

library.add(
  fab,
  faCheck,
  faTimes,
  faPlus,
  faSave,
  faWindowClose,
  faArrowCircleLeft,
  faStop,
  faWindowMaximize,
  faWindowMinimize,
  faMinus,
  faAngleDoubleDown,
  faAngleDoubleUp,
  faFilePdf,
  faFileExcel,
  faPlayCircle,
  faChevronCircleDown,
  faChevronCircleUp,
  faChevronLeft,
  faChevronRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faThumbsUp,
  faSearch,
  faImage,
  faTrash,
  faMoneyBill,
  faCreditCard,
  faMoneyCheckAlt,
  faMoneyBillAlt,
  faColumns,
  faEdit,
  faTicketAlt,
  faExchangeAlt,
  faRedo,
  faFilter,
  faCalendarAlt,
  faPrint
);

export const CloseIcon = () => <FontAwesomeIcon icon="window-close" />;
export const CheckIcon = () => <FontAwesomeIcon icon="check-square" />;
export const SaveIcon = () => <FontAwesomeIcon icon="save" />;
export const BackIcon = () => <FontAwesomeIcon icon="arrow-circle-left" />;
export const AddIcon = () => <FontAwesomeIcon icon="plus" />;
export const ExitIcon = () => <FontAwesomeIcon icon="stop" />;

export const ApproveIcon = () => <FontAwesomeIcon icon="thumbs-up" />;
export const CancelIcon = () => <FontAwesomeIcon icon="times" />;
export const PayIcon = () => <FontAwesomeIcon icon="money" />;
export const NoImageIcon = () => <FontAwesomeIcon icon={faImage} />;
export const SearchImageIcon = () => <FontAwesomeIcon icon="search" />;

export const CollapseMaximizeIcon = () => (
  <FontAwesomeIcon
    icon={faWindowMaximize}
    size="xs"
    className="custom_collapsable_icon"
  />
);
export const CollapseMinimizeIcon = () => (
  <FontAwesomeIcon
    icon={faWindowMinimize}
    size="xs"
    className="custom_collapsable_icon"
  />
);

export const AngleDoubleDownIcon = () => (
  <FontAwesomeIcon icon={faAngleDoubleDown} />
);
export const AngleDoubleUpIcon = () => (
  <FontAwesomeIcon icon={faAngleDoubleUp} />
);
export const AngleDoubleLeftIcon = () => (
  <FontAwesomeIcon icon={faAngleDoubleLeft} />
);
export const AngleDoubleRightIcon = () => (
  <FontAwesomeIcon icon={faAngleDoubleRight} />
);
export const PDFIcon = () => <FontAwesomeIcon icon={faFilePdf} />;
export const ExcelIcon = () => <FontAwesomeIcon icon={faFileExcel} />;
export const PlayIcon = () => <FontAwesomeIcon icon={faPlayCircle} />;
export const ChevronCircleDown = () => (
  <FontAwesomeIcon icon={faChevronCircleDown} />
);
export const ChevronCircleUp = () => (
  <FontAwesomeIcon icon={faChevronCircleUp} />
);
export const ChevronLeft = () => <FontAwesomeIcon icon={faChevronLeft} />;
export const ChevronRight = () => <FontAwesomeIcon icon={faChevronRight} />;

export const UndoAlt = () => <FontAwesomeIcon icon={faUndoAlt} />;
export const Undo = () => <FontAwesomeIcon icon={faUndo} />;
export const Eraser = () => <FontAwesomeIcon icon={faEraser} />;
export const DeleteIcon = () => <FontAwesomeIcon icon={faTrash} />;

export const CashIcon = () => (
  <div className="cashIcon">
    <div>
      <FontAwesomeIcon icon={faMoneyBillAlt} size="5x" title={"Cash"} />
    </div>
    <span> Cash </span>
  </div>
);
export const CardIcon = () => (
  <div className="cardIcon">
    <div>
      <FontAwesomeIcon icon={faCreditCard} size="5x" title={"Card"} />
    </div>
    <span> Card </span>
  </div>
);
export const MoneyCheckIcon = () => (
  <div className="checkIcon">
    <div>
      <FontAwesomeIcon icon={faMoneyCheckAlt} size="5x" title={"Check"} />
    </div>
    <span> Check </span>
  </div>
);

export const SplitIcon = () => (
  <div className="splitIcon">
    <div>
      <FontAwesomeIcon icon={faColumns} size="5x" title={"Split"} />
    </div>
    <span> Split </span>
  </div>
);

export const UnApproveIcon = () => <FontAwesomeIcon icon={faThumbsDown} />;

export const EditIcon = () => <FontAwesomeIcon icon={faEdit} />;
export const TicketIcon = () => <FontAwesomeIcon icon={faTicketAlt} />;

export const SearchIcon = () => <FontAwesomeIcon icon={faSearch} />;

export const SwapIcon = () => <FontAwesomeIcon icon={faExchangeAlt} />;

export const RefreshIcon = () => <FontAwesomeIcon icon={faRedo} />;
export const FilterIcon = () => <FontAwesomeIcon icon={faFilter} />;
export const CalendarIcon = () => <FontAwesomeIcon icon={faCalendarAlt} />;

export const PrintIcon = () => <FontAwesomeIcon icon={faPrint} />;

export const TickIcon = () => <FontAwesomeIcon icon={faCheck} />;
