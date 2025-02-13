import React from "react";
import Sidebar from "../../containers/sidebar";
import Header from "../../containers/header";
import BookList from "../../containers/bookList";
import BookmarkPage from "../../containers/bookmarkPage";
import NoteList from "../../containers/noteList";
import DigestList from "../../containers/digestList";
import DeleteDialog from "../../containers/deleteDialog";
import EditDialog from "../../containers/editDialog";
import AddDialog from "../../containers/addDialog";

import SortDialog from "../../containers/sortDialog";
import MessageBox from "../../containers/messageBox";
import LoadingPage from "../../containers/loadingPage";
import BackupPage from "../../containers/backupDialog";
import EmptyPage from "../../containers/emptyPage";
import WelcomeDialog from "../../containers/welcomeDialog";
import "./manager.css";
import { ManagerProps, ManagerState } from "./interface";
import { Trans } from "react-i18next";
import { getParamsFromUrl } from "../../utils/syncUtils/common";
import copy from "copy-text-to-clipboard";
import OtherUtil from "../../utils/otherUtil";
import AddFavorite from "../../utils/addFavorite";
import { updateLog } from "../../utils/readerConfig";
import UpdateDialog from "../../components/updataDialog";
import SettingDialog from "../../components/settingDialog";
import { isMobileOnly } from "react-device-detect";

class Manager extends React.Component<ManagerProps, ManagerState> {
  timer!: NodeJS.Timeout;
  constructor(props: ManagerProps) {
    super(props);
    this.state = {
      totalBooks: parseInt(OtherUtil.getReaderConfig("totalBooks") || "0") || 0,
      favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
      isAuthed: false,
      isError: false,
      isCopied: false,
      isUpdated: false,
      token: "",
    };
  }
  //从indexdb里读取书籍
  UNSAFE_componentWillMount() {
    this.props.handleFetchBooks();
    this.props.handleFetchNotes();
    this.props.handleFetchBookmarks();
    this.props.handleFetchSortCode();
    this.props.handleFetchList();
  }

  UNSAFE_componentWillReceiveProps(nextProps: ManagerProps) {
    if (nextProps.books && this.state.totalBooks !== nextProps.books.length) {
      this.setState({
        totalBooks: nextProps.books.length,
      });
      OtherUtil.setReaderConfig("totalBooks", this.state.totalBooks.toString());
    }
    if (this.props.mode !== nextProps.mode) {
      this.setState({
        favoriteBooks: Object.keys(AddFavorite.getAllFavorite()).length,
      });
    }
    if (nextProps.isMessage) {
      this.timer = setTimeout(() => {
        this.props.handleMessageBox(false);
      }, 2000);
    }
  }
  componentDidMount() {
    //判断是否是获取token后的回调页面
    let url = document.location.href;
    if (url.indexOf("error") > -1) {
      this.setState({ isError: true });
      return false;
    }
    if (url.indexOf("code") > -1) {
      let params: any = getParamsFromUrl();
      console.log(params, "params");
      this.setState({ token: params.code });
      this.setState({ isAuthed: true });
      return false;
    }
    if (url.indexOf("access_token") > -1) {
      let params: any = getParamsFromUrl();
      console.log(params, "params");
      this.setState({ token: params.access_token });
      this.setState({ isAuthed: true });
      return false;
    }
    setTimeout(() => {
      this.setState({
        isUpdated: OtherUtil.getReaderConfig("version") !== updateLog.version,
      });
      this.props.handleFirst(OtherUtil.getReaderConfig("isFirst") || "yes");
    }, 1000);
  }
  handleUpdateDialog = () => {
    this.setState({ isUpdated: false });
    OtherUtil.setReaderConfig("version", updateLog.version);
  };
  componentWillUnmout() {
    clearTimeout(this.timer);
  }

  render() {
    if (this.state.isError || this.state.isAuthed) {
      return (
        <div className="backup-page-finish-container">
          <div className="backup-page-finish">
            {this.state.isAuthed ? (
              <span className="icon-message backup-page-finish-icon"></span>
            ) : (
              <span className="icon-close auth-page-close-icon"></span>
            )}

            <div className="backup-page-finish-text">
              <Trans>
                {this.state.isAuthed
                  ? "Authorize Successfully"
                  : "Authorize Failed"}
              </Trans>
            </div>
            {this.state.isAuthed ? (
              <div
                className="token-dialog-token-text"
                onClick={() => {
                  copy(this.state.token);
                  this.setState({ isCopied: true });
                }}
              >
                {this.state.isCopied ? (
                  <Trans>Copied</Trans>
                ) : (
                  <Trans>Copy Token</Trans>
                )}
              </div>
            ) : null}
          </div>
        </div>
      );
    }
    let { mode, notes, digests, bookmarks, books } = this.props;
    let { totalBooks, favoriteBooks } = this.state;
    const updateDialogProps = {
      handleUpdateDialog: this.handleUpdateDialog,
    };
    if (isMobileOnly) {
      return (
        <>
          <p className="waring-title">
            <Trans>Warning</Trans>
          </p>
          <div className="mobile-warning">
            <span>
              <Trans>
                For better user experince, please visit this site on a computer
              </Trans>
            </span>
          </div>
          <div>
            <img src="assets/empty.svg" alt="" className="waring-pic" />
          </div>
        </>
      );
    }
    return (
      <div className="manager">
        <Sidebar />
        <Header />
        <div className="manager-dialog-container">
          {this.props.isOpenDeleteDialog ? (
            <DeleteDialog />
          ) : this.props.isOpenEditDialog ? (
            <EditDialog />
          ) : this.props.isOpenAddDialog ? (
            <AddDialog />
          ) : null}
        </div>
        {this.props.isMessage ? <MessageBox /> : null}
        {this.props.isSortDisplay ? <SortDialog /> : null}
        {this.props.isBackup ? <BackupPage /> : null}
        {!this.state.isUpdated && this.props.isFirst === "yes" ? (
          <WelcomeDialog />
        ) : null}
        {this.state.isUpdated ? <UpdateDialog {...updateDialogProps} /> : null}
        {this.props.isSettingOpen ? <SettingDialog /> : null}
        {totalBooks === 0 ? (
          <EmptyPage />
        ) : !books ? (
          <LoadingPage />
        ) : mode === "home" ||
          (mode === "favorite" && favoriteBooks !== 0) ||
          mode === "shelf" ? (
          <BookList />
        ) : bookmarks.length > 0 && mode === "bookmark" ? (
          <BookmarkPage />
        ) : notes.filter((item) => item.notes !== "").length > 0 &&
          mode === "note" ? (
          <NoteList />
        ) : digests.length > 0 && mode === "digest" ? (
          <DigestList />
        ) : (
          <EmptyPage />
        )}
      </div>
    );
  }
}

export default Manager;
