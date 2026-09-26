import React, {
  useState,
  useEffect,
  useContext
} from "react";

import { AuthContext } from "../context/AuthContext";


const PreviousPredictions = () => {

  const BASE_URL =
    import.meta.env.VITE_BASE_URL;

  const {
    user,
    isAuthenticated
  } = useContext(AuthContext);

  const [
    predictions,
    setPredictions
  ] = useState([]);

  const [
    error,
    setError
  ] = useState(null);

  const [
    isLoading,
    setIsLoading
  ] = useState(false);


  // ==========================================================
  // FETCH PREVIOUS PREDICTIONS
  // ==========================================================

  const fetchPreviousPredictions =
    async () => {

      if (
        !isAuthenticated ||
        !user ||
        !user.id
      ) {

        setError(
          "User not authenticated or missing user ID"
        );

        return;
      }

      setIsLoading(true);
      setError(null);

      try {

        const response =
          await fetch(
            `${BASE_URL}/prediction/previous-predictions?user_id=${user.id}`,
            {
              method: "GET",

              headers: {
                "Content-Type":
                  "application/json"
              }
            }
          );

        if (!response.ok) {

          const errorData =
            await response.json();

          throw new Error(
            errorData.error ||
            "Failed to fetch predictions"
          );
        }

        const data =
          await response.json();

        setPredictions(
          data.predictions || []
        );

      } catch (err) {

        setError(
          err.message
        );

        console.error(
          "Error fetching predictions:",
          err
        );

      } finally {

        setIsLoading(false);
      }
    };


  // ==========================================================
  // DELETE PREDICTION
  // ==========================================================

  const deletePrediction =
    async (id) => {

      if (
        !user ||
        !user.id
      ) {

        setError(
          "User not authenticated"
        );

        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this prediction?"
        );

      if (!confirmed) {
        return;
      }

      try {

        const response =
          await fetch(
            `${BASE_URL}/prediction/delete_prediction`,
            {
              method: "DELETE",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                user_id: user.id,
                prediction_id: id
              })
            }
          );

        if (!response.ok) {

          const errorData =
            await response.json();

          throw new Error(
            errorData.error ||
            "Failed to delete prediction"
          );
        }

        setPredictions(
          (previous) =>
            previous.filter(
              (prediction) =>
                prediction._id !== id
            )
        );

      } catch (err) {

        console.error(
          "Error deleting prediction:",
          err
        );

        setError(
          err.message
        );
      }
    };


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    if (
      isAuthenticated &&
      user &&
      user.id
    ) {

      fetchPreviousPredictions();
    }

  }, [
    isAuthenticated,
    user
  ]);


  // ==========================================================
  // FORMAT CONFIDENCE
  // ==========================================================

  const formatConfidence =
    (value) => {

      if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(
          Number(value)
        )
      ) {

        return "N/A";
      }

      return `${Number(value).toFixed(2)}%`;
    };


  // ==========================================================
  // RENDER CONFIDENCE SCORES
  // ==========================================================

  const renderConfidenceScores =
    (prediction) => {

      const scores =
        prediction.confidence_scores ||
        {};

      const predictionType =
        prediction.prediction_type ||
        "ml_ensemble";


      // ------------------------------------------------------
      // Rule-based
      // ------------------------------------------------------

      if (
        predictionType ===
        "rule-based"
      ) {

        return (
          <div>
            Rule-based:{" "}
            {formatConfidence(
              scores.rule_based
            )}
          </div>
        );
      }


      // ------------------------------------------------------
      // Current ML models
      // ------------------------------------------------------

      return (
        <div className="space-y-1">

          <div>
            RF:{" "}
            {formatConfidence(
              scores.rf
            )}
          </div>

          <div>
            NB:{" "}
            {formatConfidence(
              scores.nb
            )}
          </div>

          <div>
            XGB:{" "}
            {formatConfidence(
              scores.xgb
            )}
          </div>

          <div>
            Ensemble:{" "}
            {formatConfidence(
              scores.ensemble
            )}
          </div>

        </div>
      );
    };


  // ==========================================================
  // RENDER MODEL PREDICTIONS
  // ==========================================================

  const renderPredictions =
    (prediction) => {

      const finalPrediction =
        prediction.final_prediction;

      const predictionType =
        prediction.prediction_type ||
        "ml_ensemble";


      // ------------------------------------------------------
      // Rule-based prediction
      // ------------------------------------------------------

      if (
        predictionType ===
          "rule-based" ||
        Array.isArray(
          finalPrediction
        )
      ) {

        return (
          <div>

            {Array.isArray(
              finalPrediction
            )

              ? finalPrediction.map(
                  (pred, index) => (

                    <div key={index}>
                      {pred}
                    </div>

                  )
                )

              : finalPrediction}

          </div>
        );
      }


      // ------------------------------------------------------
      // ML predictions
      // ------------------------------------------------------

      const fp =
        finalPrediction || {};


      // ------------------------------------------------------
      // Individual model predictions
      // ------------------------------------------------------

      const rfPrediction =
        fp.rf_prediction ||
        "N/A";

      const nbPrediction =
        fp.nb_prediction ||
        "N/A";

      const xgbPrediction =
        fp.xgb_prediction ||
        "N/A";

      const ensemblePrediction =
        fp.ensemble_prediction ||
        "N/A";


      return (
        <div className="space-y-1">

          <div>
            RF: {rfPrediction}
          </div>

          <div>
            NB: {nbPrediction}
          </div>

          <div>
            XGB: {xgbPrediction}
          </div>

          <div>
            Ensemble: {ensemblePrediction}
          </div>

        </div>
      );
    };


  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  if (!isAuthenticated) {

    return (
      <div>
        Please log in to view your predictions.
      </div>
    );
  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {

    return (
      <div>
        Loading predictions...
      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="relative min-h-screen px-6 py-4">

      {/* ====================================================
          MAIN CARD
          ==================================================== */}

      <div className="relative w-full mx-auto bg-white/70 backdrop-blur-md border border-blue-300/50 shadow-lg rounded-lg overflow-hidden mt-4">


        {/* ==================================================
            HEADER
            ================================================== */}

        <div className="px-6 py-4 bg-blue-100/50 border-b border-blue-300/50">

          <h2 className="text-lg font-semibold text-blue-600">

            Previous Predictions

          </h2>

        </div>


        {/* ==================================================
            CONTENT
            ================================================== */}

        <div className="px-4 py-4 overflow-y-auto">


          {/* =================================================
              NO PREDICTIONS
              ================================================= */}

          {predictions.length === 0 ? (

            <p className="text-blue-500">

              No previous predictions found.

            </p>

          ) : (


            /* =================================================
               TABLE
               ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full border-collapse bg-white/90 rounded-lg shadow-md">


                {/* ============================================
                    TABLE HEADER
                    ============================================ */}

                <thead>

                  <tr className="bg-blue-200/50 text-blue-800">


                    <th className="px-4 py-2 text-left text-sm font-semibold">

                      Date

                    </th>


                    <th className="px-4 py-2 text-left text-sm font-semibold">

                      Symptoms

                    </th>


                    <th className="px-4 py-2 text-left text-sm font-semibold">

                      Disease

                    </th>


                    <th className="px-4 py-2 text-left text-sm font-semibold">

                      Prediction Type

                    </th>


                    <th className="px-4 py-2 text-left text-sm font-semibold">

                      Confidence

                    </th>


                    <th className="px-4 py-2 text-left text-sm font-semibold">

                      Predictions

                    </th>


                    <th className="px-4 py-2 text-center text-sm font-semibold">

                      Actions

                    </th>

                  </tr>

                </thead>


                {/* ============================================
                    TABLE BODY
                    ============================================ */}

                <tbody className="divide-y divide-blue-300/50">


                  {predictions.map(
                    (prediction) => (

                      <tr
                        key={
                          prediction._id
                        }
                        className="hover:bg-blue-100/50 transition-all"
                      >


                        {/* ==================================
                            DATE
                            ================================== */}

                        <td className="px-4 py-2">

                          {prediction.created_at

                            ? new Date(
                                prediction.created_at
                              ).toLocaleDateString()

                            : "N/A"}

                        </td>


                        {/* ==================================
                            SYMPTOMS
                            ================================== */}

                        <td className="px-4 py-2">

                          {Array.isArray(
                            prediction.symptoms
                          )

                            ? prediction.symptoms.join(
                                ", "
                              )

                            : "N/A"}

                        </td>


                        {/* ==================================
                            DISEASE
                            ================================== */}

                        <td className="px-4 py-2 text-blue-700 font-medium">

                          {prediction.disease_name ||
                            "N/A"}

                        </td>


                        {/* ==================================
                            PREDICTION TYPE
                            ================================== */}

                        <td className="px-4 py-2">

                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              prediction.prediction_type ===
                              "rule-based"

                                ? "bg-green-100 text-green-800"

                                : "bg-blue-100 text-blue-800"
                            }`}
                          >

                            {prediction.prediction_type ===
                            "rule-based"

                              ? "Rule-based"

                              : "ML"}

                          </span>

                        </td>


                        {/* ==================================
                            CONFIDENCE
                            ================================== */}

                        <td className="px-4 py-2">

                          {renderConfidenceScores(
                            prediction
                          )}

                        </td>


                        {/* ==================================
                            MODEL PREDICTIONS
                            ================================== */}

                        <td className="px-4 py-2">

                          {renderPredictions(
                            prediction
                          )}

                        </td>


                        {/* ==================================
                            DELETE
                            ================================== */}

                        <td className="px-4 py-2 text-center">

                          <button
                            onClick={() =>
                              deletePrediction(
                                prediction._id
                              )
                            }
                            className="text-red-500 hover:text-red-700"
                            title="Delete prediction"
                          >

                            ❌

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};


export default PreviousPredictions;