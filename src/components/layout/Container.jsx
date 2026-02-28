function Container({ children, className = '' }) {
  return (
    <div className={`container mx-auto px-2 py-4 sm:px-6 lg:px-1 ${className}`}>
      {children}
    </div>
  )
}

export default Container