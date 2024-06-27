import React, { useEffect, useRef, useState } from "react";
import style from "./App.module.scss";

import products from "./products.json";

interface ScannedProduct {
  scannedProduct: (typeof products)[number];
  totalPrice: number;
  totalWeight: number;
}

interface Receipt {
  scannedProducts: ScannedProduct[];
  totalPrice: number;
  totalWeight: number;
  date: string;
}

function App() {
  const [scannedProducts, setScannedProducts] = useState<
    ScannedProduct[] | null
  >(null);
  const [countProduct, setCountProduct] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof products)[number] | null
  >(null);
  const [allReceipts, setAllReceipts] = useState<Receipt[] | null>(null);
  const [selectState, setSelectState] = useState(0);

  const ref = useRef(true);
  // Восстававливаем чеки из хранилища или сохраняем изменения
  // (Этот эффект срабатывает при изменении переменной allReceipts)
  useEffect(() => {
    // Это условие отрабатывает только при запуске программы
    // и восстанавливает чеки в случаи их наличия в локальном хранилище
    if (ref.current) {
      ref.current = false;

      const prevReceiptsAsString = localStorage.getItem("allReceipts");
      let prevReceipts = null;
      if (prevReceiptsAsString) {
        prevReceipts = JSON.parse(prevReceiptsAsString) as Receipt[];
        setAllReceipts(prevReceipts);
      }
    } else {
      localStorage.setItem("allReceipts", JSON.stringify(allReceipts));
    }
  }, [allReceipts]);

  // Функция для сканирования товара
  const scan = (selectedProduct: (typeof products)[number]) => {
    setSelectedProduct(null);
    setCountProduct(1);
    setSelectState(0);

    const newObj: ScannedProduct = {
      scannedProduct: selectedProduct,
      totalPrice: selectedProduct.price * countProduct,
      totalWeight: selectedProduct.weight * countProduct,
    };

    setScannedProducts((prevState) => {
      if (prevState && prevState.length > 0) {
        const newResult = prevState.slice();
        newResult.push(newObj);
        return newResult;
      }
      return [newObj];
    });
  };

  // Печать чека
  const printReceipt = (scannedProducts: ScannedProduct[]) => {
    setScannedProducts(null);
    setCountProduct(1);
    setSelectState(0);

    const totalPrice = scannedProducts.reduce(
      (prev, curr) => prev + curr.totalPrice,
      0
    );

    const totalWeight = scannedProducts.reduce(
      (prev, curr) => prev + curr.totalWeight,
      0
    );

    const newReceipt: Receipt = {
      scannedProducts: scannedProducts,
      totalPrice,
      totalWeight,
      date: new Date().toString(),
    };

    if (allReceipts) {
      setAllReceipts([...allReceipts, newReceipt]);
    } else {
      setAllReceipts([newReceipt]);
    }
  };

  // Возврат чека
  const returnReceipt = (date: string) => {
    if (allReceipts) {
      const result = window.confirm("Вы уверены что хотите сделать возврат?");

      if (result) {
        const removedReceipts = allReceipts.filter(
          (receipt) => receipt.date !== date
        );
        setAllReceipts(removedReceipts);
      }
    }
  };

  // Убрать отсканированный товар
  const removeFromReceipt = (index: number) => {
    const result = window.confirm(
      "Вы уверены что хотите убрать отсканированный товар?"
    );

    if (result) {
      const newSelected = scannedProducts?.filter((el, i) => i !== index);

      setScannedProducts(newSelected || null);
    }
  };

  return (
    <div className={style.cashMachine}>
      <div className={style.display}>
        <header className={style.header}>
          <div className={style.currentTime}>
            {new Date().toLocaleDateString("ru-ru", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div>
            Наличных в кассе:{" "}
            {allReceipts
              ? allReceipts?.reduce(
                  (prev, cur, i) => prev + cur.totalPrice,
                  0
                ) + " руб"
              : 0}
          </div>
        </header>
        <div className={style.wrapper}>
          <div className={style.receipt}>
            <h2>Чек</h2>
            {scannedProducts && scannedProducts.length && (
              <>
                {scannedProducts.map((product, i) => {
                  return (
                    <div key={i} className={style.product}>
                      <h3>{product.scannedProduct.name}</h3>
                      <p>
                        Количество/вес:{" "}
                        <strong>
                          <i>{product.totalWeight}</i>
                        </strong>
                      </p>
                      <p>
                        Стоимость:{" "}
                        <strong>
                          <i>{product.totalPrice}</i>
                        </strong>
                      </p>
                      <button onClick={() => removeFromReceipt(i)}>
                        Убрать
                      </button>
                    </div>
                  );
                })}
                <div className={style.resultReceipt}>
                  <div>
                    Общий вес:{" "}
                    <strong>
                      <i>
                        {scannedProducts.reduce(
                          (prev, curr, i) => prev + curr.totalWeight,
                          0
                        ) / 1000}{" "}
                        кг
                      </i>
                    </strong>
                  </div>
                  <div>
                    Сумма:{" "}
                    <strong>
                      <i>
                        {scannedProducts.reduce(
                          (prev, curr, i) => prev + curr.totalPrice,
                          0
                        )}
                      </i>
                    </strong>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={style.allReceipts}>
            <h2>История</h2>
            {allReceipts &&
              allReceipts.map((receipt, i) => {
                return (
                  <div key={i} className={style.todayReceipt}>
                    <header>
                      Чек от{" "}
                      <strong>
                        <i>
                          {new Date(receipt.date).toLocaleDateString("ru-ru", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </i>
                      </strong>
                    </header>
                    {receipt.scannedProducts.map((product, i, arr) => {
                      const isLast = arr.length - 1 === i;
                      return (
                        <span className={style.product} key={i}>
                          {product.scannedProduct.name + (isLast ? "" : ", ")}
                        </span>
                      );
                    })}

                    <footer>
                      <p>
                        Кол-во/вес:{" "}
                        <strong>
                          <i>{receipt.totalWeight / 1000 + " кг"}</i>
                        </strong>
                      </p>
                      <p>
                        Стоимость:{" "}
                        <strong>
                          <i>{receipt.totalPrice} руб</i>
                        </strong>
                      </p>
                    </footer>
                    <button onClick={() => returnReceipt(receipt.date)}>
                      Возврат
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className={style.form}>
        <label>Отсканируйте товар</label>
        <select
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
            const id = +event.target.value;
            setSelectState(id);

            const foundProduct = products.find((product) => product.id === id);
            if (foundProduct) {
              setSelectedProduct(foundProduct);
              setCountProduct(1);
            }
          }}
          value={selectState}
        >
          <option value={0} defaultChecked>
            Выберите продукт
          </option>
          ;
          {products.map((product) => {
            return (
              <option value={product.id} key={product.id}>
                {product.name}
              </option>
            );
          })}
        </select>

        {selectedProduct && (
          <div className={style.scannedProducts}>
            <div>
              {selectedProduct.type === "Весовой" ? "Вес" : "Кол-во"}:{" "}
              <strong>
                <i>
                  {selectedProduct.type === "Весовой"
                    ? (selectedProduct.weight / 1000) * countProduct + " кг"
                    : countProduct +
                      " шт (" +
                      ((selectedProduct.weight / 1000) * countProduct).toFixed(
                        1
                      ) +
                      " кг)"}
                </i>
              </strong>
            </div>
            <div>
              Цена:{" "}
              <strong>
                <i>{selectedProduct.price * countProduct} руб</i>
              </strong>
            </div>
          </div>
        )}

        {selectedProduct && (
          <div className={style.weight}>
            {selectedProduct.type === "Весовой" ? "Вес" : "Количество"}:{" "}
            <button onClick={() => setCountProduct((prevValue) => ++prevValue)}>
              +
            </button>
            <button
              onClick={() => {
                if (countProduct !== 1) {
                  setCountProduct((prevValue) => --prevValue);
                }
              }}
            >
              -
            </button>
          </div>
        )}

        {selectedProduct && (
          <button onClick={() => scan(selectedProduct)}>Отсканировать</button>
        )}

        {scannedProducts && (
          <button onClick={() => printReceipt(scannedProducts)}>
            Печать чека
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
