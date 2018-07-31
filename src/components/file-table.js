import React, { Component } from 'react';
import WebTorrent from 'webtorrent';
import PrettyBytes from 'pretty-bytes';

export default class FilePicker extends Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  supportFiles = ['mp4', 'webm', 'mp3', 'flac'];

  render() {
    return (
      <div className="filesInside">
        {this.props.torrent.files &&<table>
          <thead>
            <th>Selected</th>
            <th>File name</th>
            <th>File size</th>
            <th>Loading state</th>
            <th>Play</th>
          </thead>
          <tbody>
            {this.props.torrent.files.map((file, i) => {
              return (
                <tr key={i}>
                  <td>
                    <input type="checkbox" defaultChecked={false} onChange={(e) => this.props.onChange(e, i)}/>
                  </td>
                  <td>{file.name}</td>
                  <td>{PrettyBytes(file.length)}</td>
                  <td>
                    <progress max="100" value={file.progress*100}></progress>
                  </td>
                  <td>
                    { this.supportFiles.indexOf(file.name.split('.')[1]) != -1 && <span onClick={(e) => this.props.onPlay(e, i)}>Play file</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table> }
      </div>
    );
  }
}
