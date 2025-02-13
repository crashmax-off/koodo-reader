//图书操作页面
import { connect } from "react-redux";
import {
  handleBookmarks,
  handleFetchBookmarks,
} from "../../redux/actions/reader";
import {
  handleOpenMenu,
  handleShowBookmark,
} from "../../redux/actions/viewArea";
import { stateType } from "../../redux/store";
import { withNamespaces } from "react-i18next";
import {
  handleMessageBox,
  handleMessage,
  handleSearch,
} from "../../redux/actions/manager";
import { handleReadingState } from "../../redux/actions/book";
import OperationPanel from "./component";

const mapStateToProps = (state: stateType) => {
  return {
    currentEpub: state.book.currentEpub,
    currentBook: state.book.currentBook,
    bookmarks: state.reader.bookmarks,
    locations: state.progressPanel.locations,
    flattenChapters: state.reader.flattenChapters,
  };
};
const actionCreator = {
  handleBookmarks,
  handleReadingState,
  handleFetchBookmarks,
  handleMessageBox,
  handleMessage,
  handleOpenMenu,
  handleShowBookmark,
  handleSearch,
};
export default connect(
  mapStateToProps,
  actionCreator
)(withNamespaces()(OperationPanel as any));
