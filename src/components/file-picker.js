import React, { Component } from 'react';

// get some plugins
import WebTorrent from 'webtorrent';
import DragDrop from 'drag-drop';
import PrettyBytes from 'pretty-bytes';

// components
import FileTable from './file-table';

const client = new WebTorrent();

export default class FilePicker extends Component {
  constructor(props){
    super(props);

    this.state = {
      link: '',
      torrent: {},
      showPopup: false,
    };

    this.handleChange     = this.handleChange.bind(this);
    this.handleLink       = this.handleLink.bind(this);
    this.handleFile       = this.handleFile.bind(this);
    this.toggleDownload   = this.toggleDownload.bind(this);
    this.download         = this.download.bind(this);
    this.pause            = this.pause.bind(this);
    this.playFile         = this.playFile.bind(this);
    this.closePopup       = this.closePopup.bind(this);
  }

  dropZone = null;

  componentDidMount(){
    this.dropZone = DragDrop('.dropZone', this.handleFile);
  }

  componentWillUnmount(){
    // drop DragDrop here to avoid memory allocation
    this.dropZone();
  }

  handleFile(e){
    this.cleanTorrent();

    let file = e.target ? e.target.files[0] : e[0],
        nameArr = file.name.split('.');

    if(nameArr[nameArr.length-1] == 'torrent'){
      client.add(file, (torrent) => {
        this.manageTorrent(torrent);
      })
    } else {
      //invalid file
    }
  }

  handleLink(e){
    e.preventDefault();

    this.cleanTorrent();

    client.add(this.state.link, (torrent) => {
      this.manageTorrent(torrent);
    })
  }

  handleChange(e){
    this.setState({
      link: e.target.value
    });
  }

  cleanTorrent(){
    this.setState({
      torrent: false
    });
  }

  manageTorrent(torrent){
    //prevent torrent from instant loading
    torrent.pause();

    // this is a fix for file selecting, .select() API is still unstable
    // https://github.com/webtorrent/webtorrent/issues/164
    torrent._selections = []
    torrent.deselect(0, torrent.pieces.length - 1, false);

    this.setState({
      torrent: torrent
    });
  }

  toggleDownload(evt, fileIndex){
    let checked = evt.target.checked;

    if(checked){
      this.state.torrent.files[fileIndex].select()
    } else {
      this.state.torrent.files[fileIndex].deselect()
    }
  }

  download(){
    let updateInterval = setInterval(() => this.setState({ time: Date.now() }), 300);

    // I has avoided this because of heavy performance requirements
    // this.state.torrent.on('download', (bytes) => {
    //   // this.forceUpdate();
    // })

    this.state.torrent.on('done', () => {
      clearInterval(updateInterval);
    })

    this.state.torrent.resume();
  }

  pause(){
    this.state.torrent.pause();
  }

  playFile(evt, fileIndex){
    this.state.torrent.files[fileIndex].appendTo('#player');
    this.setState({
      showPopup: true
    });
  }

  closePopup(){
    let player = document.getElementById("player");
    while (player.firstChild) {
      player.removeChild(player.firstChild);
    }

    this.setState({
      showPopup: false
    });
  }

  render() {
    return (
      <div>
        <div className="fileGetter">
          <form onSubmit={this.handleLink} >
            <div className="dropZone">
              {this.state.torrent.name ? this.state.torrent.name : 'Drop .torrent file or click here'}
              <input type="file" accept=".torrent" onInput={this.handleFile}/>
            </div>
            <p>
              <label>Or provide a magnet link url: </label>
              <input type="url" placeholder="paste magnet link here" value={this.state.link} onInput={this.handleChange}/>
              <button>get this link</button>
            </p>
          </form>
          {this.state.torrent.ready && <div className="downloadBar">
              <progress max="100" value={this.state.torrent.progress*100}></progress>
              <p>Progress: {Math.round(this.state.torrent.progress*100)}%</p>
              <p>downloaded: {PrettyBytes(this.state.torrent.downloaded)}</p>
              <p>download speed: {PrettyBytes(this.state.torrent.downloadSpeed)}</p>
            </div>
          }

          <button onClick={this.download}>Download selected</button>
          <button onClick={this.pause}>Pause all</button>
        </div>
        <div className={'popup ' + (this.state.showPopup ? 'show' : '')}>
          <div className="xbtn" onClick={this.closePopup}>+</div>
          <div id="player"></div>
        </div>
        <FileTable torrent={this.state.torrent} onChange={this.toggleDownload} onPlay={this.playFile}/>
      </div>
    );
  }
}
