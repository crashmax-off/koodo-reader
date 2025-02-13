import BookModel from "../../model/Book";

export interface BookProps {
  book: BookModel;
  currentBook: BookModel;
  isOpenActionDialog: boolean;
  handleReadingState: (isReading: boolean) => void;
  handleReadingBook: (book: BookModel) => void;
  handleReadingEpub: (epub: object) => void;
  handleActionDialog: (isShowActionDialog: boolean) => void;
  handleMessage: (message: string) => void;
  handleMessageBox: (isShow: boolean) => void;
}
export interface BookState {
  isOpenConfig: boolean;
  isFavorite: boolean;
  left: number;
  top: number;
}
