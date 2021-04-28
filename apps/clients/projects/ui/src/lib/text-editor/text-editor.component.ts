import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ui-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TextEditorComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  config = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      ['link'],
      ['clean'],
    ],
  };
}
