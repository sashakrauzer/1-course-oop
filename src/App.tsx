import React, { useEffect, useRef, useState } from "react";
// import logo from "./logo.svg";
import style from "./App.module.scss";

import products from "./products.json";

interface SelectedProduct {
  selectedProduct: (typeof products)[number];
  totalPrice: number;
  totalWeight: number;
}

interface Receipt {
  selectedProducts: SelectedProduct[];
  totalPrice: number;
  totalWeight: number;
  date: string;
}

function App() {
  const [selectedProduct, setSelectedProduct] = useState<
    SelectedProduct[] | null
  >(null);
  const [countProduct, setCountProduct] = useState<number>(1);
  const [selectedMyProduct, setSelectedMyProduct] = useState<
    (typeof products)[number] | null
  >(null);
  const [todayReceipts, setTodayReceipts] = useState<Receipt[] | null>(null);

  const [selectState, setSelectState] = useState(0);

  const ref = useRef(true);
  // Заполняем чеками из хранилища
  useEffect(() => {
    if (ref.current) {
      ref.current = false;

      const prevReceiptsAsString = localStorage.getItem("allReceipts");
      let prevReceipts = null;
      if (prevReceiptsAsString) {
        prevReceipts = JSON.parse(prevReceiptsAsString) as Receipt[];
        setTodayReceipts(prevReceipts);
      }
    } else {
      localStorage.setItem("allReceipts", JSON.stringify(todayReceipts));
    }
  }, [todayReceipts]);

  const scan = (selectedMyProduct: (typeof products)[number]) => {
    setSelectedMyProduct(null);
    setCountProduct(1);
    setSelectState(0);

    const newObj: SelectedProduct = {
      selectedProduct: selectedMyProduct,
      totalPrice: selectedMyProduct.price * countProduct,
      totalWeight: selectedMyProduct.weight * countProduct,
    };

    setSelectedProduct((prevState) => {
      if (prevState && prevState.length > 0) {
        const newResult = prevState.slice();
        newResult.push(newObj);
        return newResult;
      }
      return [newObj];
    });
  };

  const printReceipt = (selectedProduct: SelectedProduct[]) => {
    setSelectedProduct(null);
    setCountProduct(1);
    setSelectState(0);

    const totalPrice = selectedProduct.reduce(
      (prev, curr) => prev + curr.totalPrice,
      0
    );

    const totalWeight = selectedProduct.reduce(
      (prev, curr) => prev + curr.totalWeight,
      0
    );

    const newReceipt: Receipt = {
      selectedProducts: selectedProduct,
      totalPrice,
      totalWeight,
      date: new Date().toString(),
    };
    // setTodayReceipts
    // const prevReceipts = localStorage.getItem("allReceipts");
    if (todayReceipts) {
      // const newReceipts = JSON.parse(prevReceipts) as Receipt[];
      // newReceipts.push(newReceipt);
      // localStorage.setItem("allReceipts", JSON.stringify(newReceipts));

      setTodayReceipts([...todayReceipts, newReceipt]);
    } else {
      setTodayReceipts([newReceipt]);
    }
  };

  const returnReceipt = (date: string) => {
    if (todayReceipts) {
      const result = window.confirm("Вы уверены что хотите сделать возврат?");

      if (result) {
        const removedReceipts = todayReceipts.filter(
          (receipt) => receipt.date !== date
        );
        setTodayReceipts(removedReceipts);
      }
    }
  };

  const removedFromReceipts = (index: number) => {
    const result = window.confirm(
      "Вы уверены что хотите убрать отсканированный товар?"
    );

    if (result) {
      const newSelected = selectedProduct?.filter((el, i) => i !== index);

      setSelectedProduct(newSelected || null);
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
            {todayReceipts
              ? todayReceipts?.reduce(
                  (prev, cur, i) => prev + cur.totalPrice,
                  0
                ) + " руб"
              : 0}
          </div>
        </header>
        <div className={style.wrapper}>
          {/* <div>
            <h2>Отсканированный товар</h2>
            {selectedMyProduct && (
              <>
                {" "}
                <h3>
                  {selectedMyProduct.name}
                </h3>
                <p>
                  Количество/вес:{" "}
                  <strong>
                    <i>{selectedMyProduct.weight * countProduct}</i>
                  </strong>
                </p>
              </>
            )}
          </div> */}
          <div className={style.receipt}>
            <h2>Чек</h2>
            {selectedProduct && selectedProduct.length && (
              <>
                {selectedProduct.map((product, i) => {
                  return (
                    <div key={i} className={style.product}>
                      <h3>{product.selectedProduct.name}</h3>
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
                      <button onClick={() => removedFromReceipts(i)}>
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
                        {selectedProduct.reduce(
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
                        {selectedProduct.reduce(
                          (prev, curr, i) => prev + curr.totalPrice,
                          0
                        )}
                      </i>
                    </strong>
                  </div>
                </div>
              </>
            )}
            {/* {selectedProduct && } */}
          </div>
          <div className={style.todayReceipts}>
            <h2>История</h2>
            {todayReceipts &&
              todayReceipts.map((receipt, i) => {
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
                    {receipt.selectedProducts.map((product, i, arr) => {
                      const isLast = arr.length - 1 === i;
                      return (
                        <span className={style.product} key={i}>
                          {product.selectedProduct.name + (isLast ? "" : ", ")}
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
            // console.log("con", id, products[id]);
            const foundProduct = products.find((product) => product.id === id);
            if (foundProduct) {
              setSelectedMyProduct(foundProduct);
              setCountProduct(1);
            }

            // setSelectedProduct(+event.target.value);
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

        {selectedMyProduct && (
          <div className={style.selectedProduct}>
            <div>
              {selectedMyProduct.type === "Весовой" ? "Вес" : "Кол-во"}:{" "}
              <strong>
                <i>
                  {selectedMyProduct.type === "Весовой"
                    ? (selectedMyProduct.weight / 1000) * countProduct + " кг"
                    : countProduct +
                      " шт (" +
                      (
                        (selectedMyProduct.weight / 1000) *
                        countProduct
                      ).toFixed(1) +
                      " кг)"}
                </i>
              </strong>
            </div>
            <div>
              Цена:{" "}
              <strong>
                <i>{selectedMyProduct.price * countProduct} руб</i>
              </strong>
            </div>
          </div>
        )}

        {selectedMyProduct && (
          <div className={style.weight}>
            {selectedMyProduct.type === "Весовой" ? "Вес" : "Количество"}:{" "}
            {/* {selectedMyProduct.type === "Весовой"
              ? selectedMyProduct.weight * countProduct
              : countProduct + " шт."} */}
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

        {selectedMyProduct && (
          <button onClick={() => scan(selectedMyProduct)}>Отсканировать</button>
        )}

        {selectedProduct && (
          <button onClick={() => printReceipt(selectedProduct)}>
            Печать чека
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
