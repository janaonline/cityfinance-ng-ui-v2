export const currencryConversionOptions: ICurrencryConversion[] = [
  { name: "INR", type: 0 },
  { name: "INR Thousands", type: 1000 },
  { name: "INR Lakhs", type: 100000 },
  { name: "INR Crores", type: 10000000 }
];

export interface ICurrencryConversion {
  name: string;
  type: currencryConversionType;
}

export type currencryConversionType = 0 | 1000 | 100000 | 10000000;
