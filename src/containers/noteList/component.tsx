//我的笔记页面
import React from "react";
import "./noteList.css";
import { NoteListProps, NoteListState } from "./interface";
import CardList from "../../components/cardList";
import NoteTag from "../../components/noteTag";
import NoteModel from "../../model/Note";

class NoteList extends React.Component<NoteListProps, NoteListState> {
  constructor(props: NoteListProps) {
    super(props);
    this.state = {
      tag: [],
    };
  }
  handleTag = (tag: string[]) => {
    this.setState({ tag });
  };
  handleFilter = (items: any, arr: number[]) => {
    let itemArr: any[] = [];
    arr.forEach((item) => {
      items[item] && itemArr.push(items[item]);
    });
    return itemArr;
  };
  filterTag = (notes: NoteModel[]) => {
    let temp = [];
    for (let i = 0; i < notes.length; i++) {
      let flag = false;
      for (let j = 0; j < this.state.tag.length; j++) {
        if (notes[i].tag && notes[i].tag.indexOf(this.state.tag[j]) > -1) {
          flag = true;
          break;
        }
      }
      if (flag) {
        temp.push(notes[i]);
      }
    }
    return temp;
  };
  render() {
    const noteProps = {
      cards: this.props.isSearch
        ? this.handleFilter(
            this.props.notes.filter((item) => item.notes !== ""),
            this.props.searchResults
          )
        : this.state.tag.length > 0
        ? this.filterTag(this.props.notes.filter((item) => item.notes !== ""))
        : this.props.notes.filter((item) => item.notes !== ""),
      mode: "note",
    };
    return (
      <div className="note-list-container-parent">
        <div className="note-tags">
          <NoteTag {...{ handleTag: this.handleTag }} />
        </div>
        <CardList {...noteProps} />
      </div>
    );
  }
}

export default NoteList;
