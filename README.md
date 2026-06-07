# QueenBits — Predicción de Churn

Proyecto de ciencia de datos para predecir la fuga (*churn*) de clientes de una empresa de
mercadeo de bebidas: análisis exploratorio, entrenamiento de un modelo de clasificación y un
dashboard comercial interactivo construido a partir de sus resultados.

## Contenido de la carpeta

```
QueenBits/
├─ EDA.ipynb                              # Análisis exploratorio de los datos
├─ QueenBits.ipynb                        # Entrenamiento del modelo y generación de predicciones
├─ submission_QueenBits.csv               # Resultados finales: probabilidad de churn por cliente
├─ testing_completo_con_predicciones.csv  # Dataset de testing completo + predicciones del modelo
├─ 3.png … 7.png                          # Imágenes/ilustraciones usadas en el dashboard
└─ churn-dashboard/                       # Dashboard React que consume los resultados (ver su propio README)
```

## Notebooks

Ambos notebooks están escritos para **Google Colab** (las rutas de los datasets apuntan a
`/content/...`). Para correrlos:

- **En Colab** (recomendado, sin configuración adicional): sube el notebook y los CSV de entrada
  (`Coolers.csv`, `Clientes.csv`, `sales_churn_train.csv`, `sales_churn_test.csv`,
  `preds_submission.csv`) a la sesión de Colab y ejecuta las celdas en orden.
- **Localmente con Jupyter**: instala las dependencias y ajusta las rutas `/content/...` al lugar
  donde tengas los CSV de entrada.

  ```bash
  pip install pandas numpy matplotlib seaborn lightgbm scikit-learn shap jupyter
  jupyter notebook
  ```

  Luego abre `EDA.ipynb` o `QueenBits.ipynb` y reemplaza las rutas `TRAIN_PATH`, `COOLERS_PATH`,
  `CLIENTES_PATH`, etc. por la ubicación real de tus archivos.

### `EDA.ipynb` — Análisis exploratorio

Carga `sales_churn_train.csv`, `Coolers.csv` y `Clientes.csv`, los une por cliente y genera
visualizaciones (con `matplotlib`/`seaborn`) sobre la distribución del churn, volumen de ventas,
uso de equipo y demás variables — el punto de partida para entender el problema antes de modelar.

**Dependencias**: `pandas`, `numpy`, `matplotlib`, `seaborn`.

### `QueenBits.ipynb` — Modelado y predicción

Explora los datasets de entrada, prepara las variables, entrena un clasificador
**LightGBM (`LGBMClassifier`)** para predecir la probabilidad de churn, interpreta el modelo con
**SHAP** y, al final, genera las probabilidades de fuga sobre el conjunto de testing —
produciendo los dos CSV de resultados descritos abajo.

**Dependencias**: `pandas`, `numpy`, `scikit-learn`, `lightgbm`, `shap`, `matplotlib`, `seaborn`.

## CSV de resultados

- **`submission_QueenBits.csv`** — el archivo de entrega final: contiene, por cada
  `customer_id`, la **probabilidad de churn** (`probabilidad_fuga`) calculada por el modelo y su
  **nivel de riesgo** correspondiente (Bajo / Medio / Alto), ordenado según el template de entrega
  del reto.
- **`testing_completo_con_predicciones.csv`** — el dataset de testing completo (todas las
  variables originales del cliente) más las predicciones del modelo (`probabilidad_fuga`,
  `nivel_riesgo`). Es la fuente de datos a partir de la cual se preprocesaron los JSON que
  alimentan el dashboard (`churn-dashboard/src/data/`).

## Dashboard

La carpeta `churn-dashboard/` contiene una aplicación React + Express que traduce estos resultados
en un panel comercial interactivo (KPIs, gráficas de churn, lista de clientes en riesgo, simulador
y un asistente de IA). Para instrucciones de instalación y ejecución, consulta su propio
[`README.md`](./churn-dashboard/README.md).
