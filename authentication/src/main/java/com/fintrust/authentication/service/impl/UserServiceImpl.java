//package com.fintrust.authentication.service.impl;
//
//import com.fintrust.authentication.model.User;
//import com.fintrust.authentication.repository.UserRepository;
//import com.fintrust.authentication.service.UserService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor
//public class UserServiceImpl implements UserService {
//    private final UserRepository userRepository;
//
//    @Override
//    public Optional<User> findByEmail(String email) {
//        return userRepository.findByEmail(email);
//    }
//
//    @Override
//    public User save(User user) {
//        return userRepository.save(user);
//    }
//}
