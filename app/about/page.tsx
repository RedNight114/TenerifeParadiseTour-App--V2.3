import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="w-full max-w-full overflow-x-hidden">
        <section className="relative h-96 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white overflow-hidden">
          <div className="text-center">
            <h1 className="text-4xl font-bold">About Us</h1>
            <p className="mt-2 text-lg">Learn more about our company and our mission.</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-700">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
              <p className="text-gray-700">
                Our mission is to provide high-quality products and services that meet the needs of our customers. We
                are committed to innovation, excellence, and customer satisfaction. We strive to create a positive
                impact on the world through our work.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-100">
          <h2 className="text-3xl font-semibold mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl max-w-full">
                <Image
                  src="/team1.jpg"
                  alt="Team Member 1"
                  layout="fill"
                  objectFit="cover"
                  className="object-cover w-full h-full max-w-full"
                />
              </div>
              <h3 className="text-xl font-semibold mt-4">John Doe</h3>
              <p className="text-gray-600">CEO</p>
            </div>
            <div className="text-center">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl max-w-full">
                <Image
                  src="/team2.jpg"
                  alt="Team Member 2"
                  layout="fill"
                  objectFit="cover"
                  className="object-cover w-full h-full max-w-full"
                />
              </div>
              <h3 className="text-xl font-semibold mt-4">Jane Smith</h3>
              <p className="text-gray-600">CTO</p>
            </div>
            <div className="text-center">
              <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl max-w-full">
                <Image
                  src="/team3.jpg"
                  alt="Team Member 3"
                  layout="fill"
                  objectFit="cover"
                  className="object-cover w-full h-full max-w-full"
                />
              </div>
              <h3 className="text-xl font-semibold mt-4">Peter Jones</h3>
              <p className="text-gray-600">Marketing Manager</p>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-semibold mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Integrity</h3>
              <p className="text-gray-700">
                We are committed to honesty, transparency, and ethical behavior in all our interactions.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-700">
                We embrace creativity and are constantly seeking new and better ways to serve our customers.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Customer Focus</h3>
              <p className="text-gray-700">
                We put our customers first and are dedicated to providing exceptional service and support.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
