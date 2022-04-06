import React, {useReducer, useEffect,  useCallback, useMemo} from 'react';

import IngredientForm from './IngredientForm';
import IngredientList from './IngredientList';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';
import useHttp from '../../hooks/http';

const ingredientReducer = (stateCurrentIngredients, action) => {
     switch(action.type) {
       case 'SET':
           return action.ingredients;

       case 'ADD':
           return [...stateCurrentIngredients, action.ingredient];

       case 'DELETE':
           return stateCurrentIngredients.filter(ing => ing.id !== action.id);

       default:
         throw new Error('Should not get there!');
     }
};



function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);

   const {isLoading, error, data, sendRequest, reqExtra , reqIdentifier, clear } = useHttp();


  useEffect(() => {
    if(!isLoading && !error &&  reqIdentifier === 'REMOVE_INGREDIENT') {
       dispatch({ type: 'DELETE', id: reqExtra})
      } else if(!isLoading && !error &&  reqIdentifier === 'ADD_INGREDIENT') {
        dispatch({
          type: 'ADD' , ingredient :  { id: data.name, ...reqExtra}
        })
      }
}, [data, reqExtra, reqIdentifier , isLoading, error]);

   const filteredIngerdientsHandler = useCallback((filteredIngredients) => {
          dispatch({ type: 'SET', ingredients : filteredIngredients });
   }, []);

   

   const addIngredientHandler = useCallback(ingredient => {
     sendRequest('https://hooks-summary-f19f9-default-rtdb.europe-west1.firebasedatabase.app/ingredients.json', 
     'POST',
     JSON.stringify(ingredient),
     ingredient,
     'ADD_INGREDIENT',
     );
    }, [sendRequest]);
     

   const removeIngredientHandler = useCallback((ingredientId) => {
     sendRequest(`https://hooks-summary-f19f9-default-rtdb.europe-west1.firebasedatabase.app/ingredients/${ingredientId}.json`,
     'DELETE',
     null,
     ingredientId,
     'REMOVE_INGREDIENT',
     ); 
   }, [sendRequest]);



   const ingredientList = useMemo(() => {
     return (
      <IngredientList  
      ingredients={userIngredients} 
      onRemoveItem={removeIngredientHandler}
      />
     );
   }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}> {error} </ErrorModal> }

      <IngredientForm 
      onAddIngredient={addIngredientHandler} 
      loading={isLoading} />

      <section>
        <Search onLoadIngredients={filteredIngerdientsHandler} />

        {ingredientList}
      
      </section>
    </div>
  );
}

export default Ingredients;
