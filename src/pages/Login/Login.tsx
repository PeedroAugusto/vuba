import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import Logo from '../../assets/images/logo.png';
import styles from './Login.module.scss';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData): Promise<void> => {
    setError('');
    setLoading(true);

    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Entrar • Vuba";
  }, [])

  return (
    <div className={styles['login-page']} data-testid="login-page">
      <img src={Logo} className={styles.logo} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1>Entrar</h1>
        <p className={styles['sub-title']}>Digite o endereço de e-mail e a senha da sua conta VUBA</p>
        {(error) ? <p className={`${styles['error-message']} ${styles['login-fail']}`}><i className='bx bx-error-circle'></i>O endereço de e-mail ou a senha não estão corretos.</p> : <></>}
        <div className={styles['input-group']}>
          <a>Endereço de e-mail</a>
          <input
            placeholder=''
            type="text"
            {...register("email", {
              required: 'Por favor, preencha o campo de email.',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                message: 'Por favor, insira um email válido.'
              }
            })}
            className={`${styles.email} ${errors.email ? styles.error : ''}`}
          />
          <ErrorMessage errors={errors} name="email" as="p" className={styles['error-message']} />
        </div>

        <div className={styles['input-group']}>
          <a>Senha</a>
          <input
            placeholder=''
            type="password"
            {...register("password", {
              required: 'Por favor, preencha o campo de senha.',
              minLength: {
                value: 8,
                message: 'A senha deve ter pelo menos 8 caracteres.'
              }
            })}
            className={`${styles.password} ${errors.password ? styles.error : ''}`}
          />
          <ErrorMessage errors={errors} name="password" as="p" className={styles['error-message']} />
        </div>
        <a href="URL_do_Link" target="_blank" className={styles.forgot}>Esqueceu sua senha?</a>
        <button type="submit" className={styles.login}>
          {loading ? <i className='bx bx-loader-alt bx-spin'></i> : <>Entrar</>}
        </button>
      </form>
    </div>
  );
};

export default Login; 