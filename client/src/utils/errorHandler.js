import toast from 'react-hot-toast';

export const errorHandler = (error, fallback = 'Bir hata oluştu') => {
  console.error('Error:', error);

  // Network error
  if (!error.response) {
    toast.error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
    return;
  }

  const { status, data } = error.response;

  // Handle specific status codes
  switch (status) {
    case 400:
      toast.error(data?.message || 'Geçersiz istek');
      break;
    case 401:
      toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
      // Redirect to login if needed
      break;
    case 403:
      toast.error('Bu işlem için yetkiniz yok');
      break;
    case 404:
      toast.error('Kayıt bulunamadı');
      break;
    case 422:
      if (data?.errors) {
        Object.values(data.errors).forEach((err) => {
          if (Array.isArray(err)) {
            err.forEach((msg) => toast.error(msg));
          } else {
            toast.error(err);
          }
        });
      } else {
        toast.error(data?.message || 'Doğrulama hatası');
      }
      break;
    case 429:
      toast.error('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.');
      break;
    case 500:
      toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      break;
    default:
      toast.error(data?.message || fallback);
  }
};

export const showSuccess = (message) => {
  toast.success(message);
};

export const showWarning = (message) => {
  toast.warning(message);
};

export const showInfo = (message) => {
  toast.info(message);
};