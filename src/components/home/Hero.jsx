// import { Link } from 'react-router-dom'
// import Container from '../layout/Container'
// import { ArrowRightIcon } from '@heroicons/react/24/outline'


// export default function Hero() {
//   return (
//     <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white">
//       <div className="absolute inset-0 bg-black/10" />
//       <Container>
//         <div className="relative py-16px ">
//           <div className="max-w-2xl">
//             <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
//               <span className="text-sm font-medium">🎉 Summer Sale: Up to 50% OFF</span>
//             </div>
//             <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
//               Discover Amazing
//               <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
//                 Products & Deals
//               </span>
//             </h1>
//             <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl">
//               Shop the latest trends in electronics, fashion, home decor and more. 
//               Quality products at unbeatable prices.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <Link to="/products">
//                 <button className="group flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105">
//                   Start Shopping
//                   <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
//                 </button>
//               </Link>
//               {/* <Link to="/deals">
//                 <button className="group flex items-center gap-2 border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
//                   View Deals
//                 </button>
//               </Link> */}
//             </div>
//           </div>
//         </div>
//       </Container>
//     </section>
    
//   )
// }

// import { useState, useEffect, useCallback } from 'react'
// import { Link } from 'react-router-dom'
// import Container from '../layout/Container'
// import { ArrowRightIcon } from '@heroicons/react/24/outline'
// import Slider1 from '../../assets/slider1.jpg'
// import Slider2 from '../../assets/slider2.jpg'
// import Slider3 from '../../assets/slider3.jpg'

// export default function Hero() {
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const [progress, setProgress] = useState(0)

//   const slides = [
//     {
//       id: 1,
//       image: Slider1,
//       mobileImage: Slider1, // You can create separate optimized mobile images
//       tabletImage: Slider1, // and tablet images if needed
//       title: 'Summer Sale',
//       description: 'Get up to 50% off on selected items',
//       buttonText: 'Shop Sale'
//     },
//     {
//       id: 2,
//       image: Slider2,
//       mobileImage: Slider2,
//       tabletImage: Slider2,
//       title: 'New Arrivals',
//       description: 'Discover our latest collection',
//       buttonText: 'Explore'
//     },
//     {
//       id: 3,
//       image: Slider3,
//       mobileImage: Slider3,
//       tabletImage: Slider3,
//       title: 'Premium Quality',
//       description: 'Shop the best products online',
//       buttonText: 'Shop Now'
//     }
//   ]

//   const nextSlide = useCallback(() => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length)
//     setProgress(0)
//   }, [slides.length])

//   const goToSlide = (index) => {
//     setCurrentSlide(index)
//     setProgress(0)
//   }

//   // Auto slide with progress tracking
//   useEffect(() => {
//     let intervalId
//     let progressIntervalId
    
//     const startProgress = () => {
//       setProgress(0)
//       progressIntervalId = setInterval(() => {
//         setProgress((prev) => {
//           if (prev >= 100) {
//             clearInterval(progressIntervalId)
//             nextSlide()
//             return 0
//           }
//           return prev + 1 / 40
//         })
//       }, 40)
//     }

//     intervalId = setInterval(nextSlide, 4000)
//     startProgress()

//     return () => {
//       clearInterval(intervalId)
//       clearInterval(progressIntervalId)
//     }
//   }, [nextSlide])

// return (
//   <section className="relative overflow-hidden">
    
//     {/* ================= MOBILE SLIDER ================= */}
//     <div className="lg:hidden">
//       <div className="relative h-[203px] w-full overflow-hidden">
//         {slides.map((slide, index) => (
//           <div
//             key={slide.id}
//             className={`absolute inset-0 w-full transition-opacity duration-500 ${
//               index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
//             }`}
//           >
//             {/* Image */}
//             <img
//               src={slide.image}
//               alt={slide.title}
//               className="w-full h-full object-cover object-center"
//             />

//             {/* Overlay */}
//             <div className="absolute inset-0 bg-black/40" />

//             {/* Mobile Content */}
//             <Container>
//               <div className="relative h-full flex items-center px-4">
//                 <div className="text-white max-w-xs">
//                   <h2 className="text-xl font-bold mb-1">
//                     {slide.title}
//                   </h2>
//                   <p className="text-sm text-white/90 mb-3">
//                     {slide.description}
//                   </p>
//                   <Link to="/products">
//                     <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-semibold">
//                       {slide.buttonText}
//                       <ArrowRightIcon className="w-4 h-4" />
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </Container>
//           </div>
//         ))}

//         {/* Mobile Indicators */}
//         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
//           {slides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => goToSlide(index)}
//               className={`w-2 h-2 rounded-full transition-all ${
//                 index === currentSlide ? 'bg-white w-6' : 'bg-white/60'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>

//     {/* ================= DESKTOP SLIDER ================= */}
//     <div className="hidden lg:block">
//       <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
//         {slides.map((slide, index) => (
//           <div
//             key={slide.id}
//             className={`absolute inset-0 w-full transition-opacity duration-500 ${
//               index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
//             }`}
//           >
//             {/* Image */}
//             <img
//               src={slide.image}
//               alt={slide.title}
//               className="w-full h-full object-cover object-center"
//             />

//             {/* Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

//             {/* Desktop Content */}
//             <Container>
//               <div className="relative h-full flex items-center">
//                 <div className="max-w-2xl text-white pl-8">
//                   <h1 className="text-6xl font-bold mb-6 leading-tight">
//                     {slide.title}
//                   </h1>
//                   <p className="text-2xl text-white/90 mb-8">
//                     {slide.description}
//                   </p>
//                   <Link to="/products">
//                     <button className="flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100">
//                       {slide.buttonText}
//                       <ArrowRightIcon className="w-6 h-6" />
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </Container>
//           </div>
//         ))}

//         {/* Desktop Indicators */}
//         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
//           {slides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => goToSlide(index)}
//               className={`w-3 h-3 rounded-full transition-all ${
//                 index === currentSlide ? 'bg-white w-10' : 'bg-white/60'
//               }`}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   </section>
// )

// }


import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Container from '../layout/Container'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Slider1 from '../../assets/slider1.jpg'
import Slider2 from '../../assets/slider2.jpg'
import Slider3 from '../../assets/slider3.jpg'

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [progress, setProgress] = useState(0)

  const slides = [
    {
      id: 1,
      image: Slider1,
      title: 'Summer Sale',
      description: 'Get up to 50% off on selected items',
      buttonText: 'Shop Sale'
    },
    {
      id: 2,
      image: Slider2,
      title: 'New Arrivals',
      description: 'Discover our latest collection',
      buttonText: 'Explore'
    },
    {
      id: 3,
      image: Slider3,
      title: 'Premium Quality',
      description: 'Shop the best products online',
      buttonText: 'Shop Now'
    }
  ]

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }, [slides.length])

  const goToSlide = (index) => {
    setCurrentSlide(index)
    setProgress(0)
  }

  // Auto slide with progress
  useEffect(() => {
    let intervalId
    let progressIntervalId

    const startProgress = () => {
      setProgress(0)
      progressIntervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressIntervalId)
            nextSlide()
            return 0
          }
          return prev + 1 / 40
        })
      }, 40)
    }

    intervalId = setInterval(nextSlide, 4000)
    startProgress()

    return () => {
      clearInterval(intervalId)
      clearInterval(progressIntervalId)
    }
  }, [nextSlide])

  return (
    <section className="relative overflow-hidden">
      
      {/* ================= MOBILE SLIDER ================= */}
      <div className="lg:hidden">
        <div className="relative h-[203px] w-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Mobile Content */}
              <Container>
                <div className="relative h-full flex items-center px-4">
                  <div className="text-white max-w-xs animate-fadeInUp">
                    <h2 className="text-xl font-bold mb-1 drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="text-sm text-white/90 mb-3 drop-shadow">
                      {slide.description}
                    </p>
                    <Link to="/products">
                      <button className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-100 transition-all active:scale-95">
                        {slide.buttonText}
                        <ArrowRightIcon className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>
                </div>
              </Container>
            </div>
          ))}

          {/* Mobile Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Mobile Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 z-20">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= DESKTOP SLIDER ================= */}
      <div className="hidden lg:block">
        <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

              {/* Desktop Content */}
              <Container>
                <div className="relative h-full flex items-center">
                  <div className="max-w-2xl text-white pl-8 animate-fadeInUp">
                    <h1 className="text-6xl font-bold mb-6 leading-tight drop-shadow-xl">
                      {slide.title}
                    </h1>
                    <p className="text-2xl text-white/90 mb-8 drop-shadow">
                      {slide.description}
                    </p>
                    <Link to="/products">
                      <button className="flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all hover:scale-105 active:scale-95">
                        {slide.buttonText}
                        <ArrowRightIcon className="w-6 h-6" />
                      </button>
                    </Link>
                  </div>
                </div>
              </Container>
            </div>
          ))}

          {/* Desktop Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'bg-white w-10' : 'bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Desktop Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-20">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
