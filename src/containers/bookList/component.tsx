//全部图书，最近阅读，搜索结果，排序结果的数据
import React from "react";
import "./booklist.css";
import Book from "../../components/bookCardtem";
import BookItem from "../../components/bookListItem";
import AddFavorite from "../../utils/addFavorite";
import RecordRecent from "../../utils/recordRecent";
import ShelfUtil from "../../utils/shelfUtil";
import SortUtil from "../../utils/sortUtil";
import BookModel from "../../model/Book";
import { Trans, NamespacesConsumer } from "react-i18next";
import { BookListProps, BookListState } from "./interface";
import OtherUtil from "../../utils/otherUtil";
import localforage from "localforage";
import DeletePopup from "../../components/deletePopup";

declare var window: any;

class BookList extends React.Component<BookListProps, BookListState> {
  constructor(props: BookListProps) {
    super(props);
    this.state = {
      shelfIndex: 0,
      isOpenDelete: false,
    };
  }
  componentDidMount() {
    this.handleOldVersion();
  }
  handleOldVersion = async () => {
    if (!this.props.books[0].cover) {
      let bookArr: any = this.props.books;
      for (let i = 0; i < bookArr.length; i++) {
        await new Promise(async (resolve, reject) => {
          let epub;
          if (bookArr[i].content) {
            epub = window.ePub(bookArr[i].content, {});
            localforage.setItem(bookArr[i].key, bookArr[i].content).then(() => {
              delete bookArr[i].content;
            });
          } else {
            let data = await new Promise((resolve, reject) => {
              localforage.getItem(bookArr[i].key).then((result) => {
                resolve(result);
              });
            });
            epub = window.ePub(data, {});
          }

          let url = await epub.coverUrl();
          var reader = new FileReader();
          let blob = await fetch(url).then((r) => r.blob());
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            let cover = reader.result;
            bookArr[i].cover = cover;
            resolve();
          };
        });
      }

      localforage.setItem("books", bookArr);
      window.location.reload();
    }
  };
  handleFavorite = (items: any[], arr: string[]) => {
    let itemArr: any[] = [];
    arr.forEach((item) => {
      items.forEach((subItem: any) => {
        if (subItem.key === item) {
          itemArr.push(subItem);
        }
      });
    });
    return itemArr;
  };
  //根据localstorage列表的数据，得到最近阅读的图书
  handleRecent = (items: any[], arr: string[]) => {
    let itemArr: any[] = [];
    //兼容之前的版本
    if (!arr[0] || arr.length !== items.length) {
      RecordRecent.setAllRecent(items);
      return items;
    }
    arr.forEach((item) => {
      items.forEach((subItem: any) => {
        if (subItem.key === item) {
          itemArr.push(subItem);
        }
      });
    });
    return itemArr;
  };

  //获取书架数据
  handleShelf(items: any, index: number) {
    //获取书架名
    if (index < 1) return items;
    let shelfTitle = Object.keys(ShelfUtil.getShelf());
    //获取当前书架名
    let currentShelfTitle = shelfTitle[index];
    if (!currentShelfTitle) return items;
    //获取当前书架的图书列表
    let currentShelfList = ShelfUtil.getShelf()[currentShelfTitle];
    //根据图书列表获取到图书数据
    let shelfItems = items.filter((item: { key: number }) => {
      return currentShelfList.indexOf(item.key) > -1;
    });
    return shelfItems;
  }
  //控制卡片模式和列表模式的切换
  handleChange = (mode: string) => {
    OtherUtil.setReaderConfig("isList", mode);
    this.props.handleFetchList();
  };
  //根据搜索图书index获取到搜索出的图书
  handleFilter = (items: any, arr: number[]) => {
    let itemArr: any[] = [];
    arr.forEach((item) => {
      items[item] && itemArr.push(items[item]);
    });
    return itemArr;
  };
  renderBookList = () => {
    //根据不同的场景获取不同的图书数据
    let books = this.props.isSearch
      ? this.handleFilter(this.props.books, this.props.searchResults)
      : this.props.shelfIndex > 0
      ? this.handleShelf(this.props.books, this.props.shelfIndex)
      : this.props.mode === "favorite" && !this.props.isSort
      ? this.handleFavorite(this.props.books, AddFavorite.getAllFavorite())
      : this.props.mode === "favorite" && this.props.isSort
      ? this.handleFilter(
          this.handleFavorite(this.props.books, AddFavorite.getAllFavorite()),
          //返回排序后的图书index
          SortUtil.sortBooks(this.props.books, this.props.sortCode) || []
        )
      : this.props.isSort
      ? this.handleFilter(
          this.props.books,
          //返回排序后的图书index
          SortUtil.sortBooks(this.props.books, this.props.sortCode) || []
        )
      : this.handleRecent(this.props.books, RecordRecent.getAllRecent());

    return books.map((item: BookModel, index: number) => {
      return this.props.isList === "list" ? (
        <BookItem
          {...{
            key: item.key,
            book: item,
          }}
        />
      ) : (
        <Book key={item.key} book={item} />
      );
    });
  };
  //切换书架
  handleShelfItem = (event: any) => {
    let index = event.target.value.split(",")[1];
    this.setState({ shelfIndex: index });
    this.props.handleShelfIndex(index);
    if (index > 0) {
      this.props.handleMode("shelf");
    } else {
      this.props.handleMode("home");
    }
  };
  handleDeleteShelf = () => {
    if (this.state.shelfIndex < 1) return;
    let shelfTitles = Object.keys(ShelfUtil.getShelf());
    //获取当前书架名
    let currentShelfTitle = shelfTitles[this.state.shelfIndex];
    ShelfUtil.removeShelf(currentShelfTitle);
    this.setState({ shelfIndex: 0 }, () => {
      this.props.handleShelfIndex(0);
      this.props.handleMode("shelf");
    });
  };
  renderShelfList = () => {
    let shelfList = ShelfUtil.getShelf();
    let shelfTitle = Object.keys(shelfList);
    return shelfTitle.map((item, index) => {
      return (
        <NamespacesConsumer key={index}>
          {(t) => (
            <option
              value={[item, index.toString()]}
              key={index}
              className="add-dialog-shelf-list-option"
              selected={this.props.shelfIndex === index ? true : false}
            >
              {t(item === "New" ? "All Books" : item)}
            </option>
          )}
        </NamespacesConsumer>
      );
    });
  };
  handleDeletePopup = (isOpenDelete: boolean) => {
    this.setState({ isOpenDelete });
  };
  render() {
    const deletePopupProps = {
      mode: "shelf",
      name: Object.keys(ShelfUtil.getShelf())[this.state.shelfIndex],
      title: "Delete this shelf",
      description: "This action will clear and remove this shelf",
      handleDeletePopup: this.handleDeletePopup,
      handleDeleteOpearion: this.handleDeleteShelf,
    };
    OtherUtil.setReaderConfig("totalBooks", this.props.books.length.toString());
    return (
      <>
        {this.state.isOpenDelete && <DeletePopup {...deletePopupProps} />}
        <div className="book-list-view">
          <div
            className="card-list-mode"
            onClick={() => {
              this.handleChange("card");
            }}
            style={
              this.props.isList === "card"
                ? {}
                : { color: "rgba(75,75,75,0.5)" }
            }
          >
            <span className="icon-grid"></span>
            <Trans>Card Mode</Trans>
          </div>
          <div
            className="list-view-mode"
            onClick={() => {
              this.handleChange("list");
            }}
            style={
              this.props.isList === "list"
                ? {}
                : { color: "rgba(75,75,75,0.5)" }
            }
          >
            <span className="icon-list"></span> <Trans>List Mode</Trans>
          </div>
        </div>
        <div className="booklist-shelf-container">
          <p className="general-setting-title" style={{ display: "inline" }}>
            <Trans>My Shelves</Trans>
          </p>
          <select
            className="booklist-shelf-list"
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              this.handleShelfItem(event);
            }}
          >
            {this.renderShelfList()}
          </select>
          {this.state.shelfIndex > 0 ? (
            <span
              className="icon-trash delete-shelf-icon"
              onClick={() => {
                this.handleDeletePopup(true);
              }}
            ></span>
          ) : null}
        </div>
        <div className="book-list-container-parent">
          <div className="book-list-container">
            <ul className="book-list-item-box">{this.renderBookList()}</ul>
          </div>
        </div>
      </>
    );
  }
}

export default BookList;
