import { FileUrlCheckPipe } from './file-url-check.pipe';

describe('FileUrlCheckPipe', () => {
  it('create an instance', () => {
    const pipe = new FileUrlCheckPipe();
    expect(pipe).toBeTruthy();
  });

  it('returns true when url ends with the target extension and extension is allowed', () => {
    const pipe = new FileUrlCheckPipe();

    expect(pipe.transform('https://cdn.example.com/report.PDF', 'pdf', ['pdf', 'xlsx'])).toBeTrue();
  });

  it('returns false when the extension does not match or is not allowed', () => {
    const pipe = new FileUrlCheckPipe();

    expect(pipe.transform('https://cdn.example.com/report.xlsx', 'pdf', ['pdf'])).toBeFalse();
    expect(pipe.transform('https://cdn.example.com/report.pdf', 'pdf', ['xlsx'])).toBeFalse();
  });
});
