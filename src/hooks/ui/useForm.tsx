import { useState, useCallback, useMemo } from 'react';

interface FormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Record<keyof T, string> | null;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

export const useForm = <T extends Record<string, any>>(options: FormOptions<T>) => {
  const { initialValues, onSubmit, validate } = options;

  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false,
  });

  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!validate) return null;

      const validationErrors = validate({ ...state.values, [name]: value });
      return validationErrors ? validationErrors[name] : null;
    },
    [validate, state.values]
  );

  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      const error = validateField(name, value);

      setState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: value },
        errors: { ...prev.errors, [name]: error },
        isDirty: true,
      }));
    },
    [validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setState(prev => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setState(prev => ({ ...prev, isSubmitting: true }));

      let errors = null;
      if (validate) {
        errors = validate(state.values);
      }

      if (errors) {
        setState(prev => ({
          ...prev,
          errors,
          touched: Object.keys(prev.values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          ),
          isSubmitting: false,
        }));
        return;
      }

      try {
        await onSubmit(state.values);
        setState(prev => ({
          ...prev,
          errors: {},
          touched: {},
          isDirty: false,
          isSubmitting: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSubmitting: false,
        }));
        console.error('Erro ao enviar formulário:', error);
      }
    },
    [onSubmit, state.values, validate]
  );

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isDirty: false,
    });
  }, [initialValues]);

  const formState = useMemo(
    () => ({
      values: state.values,
      errors: state.errors,
      touched: state.touched,
      isSubmitting: state.isSubmitting,
      isDirty: state.isDirty,
      isValid: Object.keys(state.errors).length === 0,
    }),
    [state]
  );

  return {
    ...formState,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}; 