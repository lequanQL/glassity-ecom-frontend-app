import { Component } from '@angular/core';
import { ProductItem } from '../../components/ProductItem/ProductItem';

@Component({
  selector: 'ladi-page',
  templateUrl: './LandiPage.html',
  styleUrl: './LandiPage.css',
  imports: [ProductItem]
})
export class LandiPage {
  products = [
    {
      img: '../../../assets/images/ladipage/sp1.png',
      code: 'PO3348C',
      price: 499000,
      id: 1
    },
    {
      img: '../../../assets/images/ladipage/sp2.png',
      code: 'PO3354C',
      price: 385000,
      id: 2
    },
    {
      img: '../../../assets/images/ladipage/sp3.png',
      code: 'PO3360C',
      price: 449000,
      id: 3
    },
    {
      img: '../../../assets/images/ladipage/sp4.png',
      code: 'PO3365C',
      price: 467000,
      id: 4
    },
    {
      img: '../../../assets/images/ladipage/sp5.png',
      code: 'PO3312S',
      price: 399000,
      id: 5
    },
    {
      img: '../../../assets/images/ladipage/sp6.png',
      code: 'PO3333S',
      price: 249000,
      id: 6
    },
    {
      img: '../../../assets/images/ladipage/sp7.png',
      code: 'PO3305S',
      price: 279000,
      id: 7
    },
    {
      img: '../../../assets/images/ladipage/sp8.png',
      code: 'PO33005Q',
      price: 1199000,
      id: 8
    }
  ]
}
