import 'jasmine';
import { isArray } from 'lodash';

import { createElement } from './create-element';

describe('RenderKit:createElement', () => {

  it("throws with invalid type", () => {

    const jasmineHack = () => createElement('container2' as any);
    expect(jasmineHack).toThrowError('Invalid type passed to createElement: container2');
  });

  it("returns empty children array", () => {
    const result = createElement('container');

    expect(result.props.children).toEqual([]);
    expect(result.children).toEqual([]);
  });

  it("returns empty props with children", () => {
    const result = createElement('container');

    expect(result.props).toEqual({ children: [] });
  });

  it("returns single child props, but array in the RzElement", () => {
    const result = createElement('container', null, createElement('container'));

    expect(isArray(result.children)).toBe(true);
    expect(result.children.length).toBe(1);
    expect(result.props.children).toEqual({ type: 'container', children: [], props: { children: [] } });
  });
  
  it("flattens nested arrays of children", () => {
    const result = createElement('container', null, [createElement('container'), createElement('container')]);

    expect(result.children.length).toBe(1);
    expect(isArray(result.children[0])).toBe(true);
    expect((result.props.children as any[]).length).toEqual(2);

  });

});