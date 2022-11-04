import { Brackets, WhereExpressionBuilder } from 'typeorm';

export const eqCondition = (column: string, value: any) => {
  if (!value) return new Brackets(() => {});

  const whereFactory = (qb: WhereExpressionBuilder) => {
    qb.where(`${column} = :value`, { value });
  };

  return new Brackets(whereFactory);
};

export const ltCondition = (column: string, value: any) => {
  if (!value) return new Brackets(() => {});

  const whereFactory = (qb: WhereExpressionBuilder) => {
    qb.where(`${column} < :value`, { value });
  };

  return new Brackets(whereFactory);
};

export const containsCondition = (columns: string[], keyword: string) => {
  if (keyword.length === 0) {
    return new Brackets(() => {});
  }

  const words = keyword.split(/ /g);

  const whereFactory = (qb: WhereExpressionBuilder) => {
    columns.forEach((column) => {
      words.forEach((word) => {
        qb.orWhere(`${column} = :word`, { word: `%${word}%` });
      });
    });
  };

  return new Brackets(whereFactory);
};
