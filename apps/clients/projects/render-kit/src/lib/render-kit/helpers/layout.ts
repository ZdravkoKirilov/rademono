import { max } from 'lodash';

export const composeGrid = (
  items: Array<{ height: number; width: number; }>,
  maxRowWidth: number,
  gap: string
) => {
  const [hGap, vGap] = gap.split(' ').map(elem => Number(elem));
  const rows: { height: number; width: number; }[][] = [];
  let topCoord = 0;
  let leftCoord = 0;
  let rowIndex = 0;

  const result = items.map(elem => {
    const result = { x: leftCoord, y: topCoord };

    if (leftCoord + elem.width <= maxRowWidth) {
      const row = rows[rowIndex] || [];
      rows[rowIndex] = row;
      row.push(elem);
    } else {
      const prevRow = rows[rowIndex] || [];
      const prevHeight = max(prevRow.map(elem => elem.height)) || 0;
      rowIndex += 1;
      leftCoord = 0;
      topCoord = topCoord + prevHeight + vGap;

      result.y = topCoord;
      result.x = leftCoord;

      rows.push([elem]);
    }

    leftCoord = leftCoord + elem.width + hGap;

    return { ...elem, ...result };
  });

  return result;
};

export const gridItems = [
  {
    width: 200,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 200,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 560,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 200,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 300,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 300,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 200,
    height: 300,
    fill: 0x99ff99,
  }, {
    width: 200,
    height: 200,
    fill: 0x99ff99,
  }, {
    width: 1000,
    height: 200,
    fill: 0x99ff99,
  }
]

export const composeList = (items: Array<{ height: number }>, gap = 20) => {
  let topCoord = 0;

  return items.map(elem => {
    const result = { y: topCoord, x: 0 };
    topCoord += (elem.height + gap);
    return result;
  });
};